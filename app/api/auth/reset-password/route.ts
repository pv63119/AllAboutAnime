import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { hashResetToken, isTokenExpired } from '@/lib/auth/password-reset';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({
                error: 'Token and password are required'
            }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({
                error: 'Password must be at least 6 characters'
            }, { status: 400 });
        }

        await dbConnect();

        // Hash the token to match database
        const hashedToken = hashResetToken(token);

        // Find user raw to bypass potential schema issues
        const rawUser = await User.collection.findOne({
            passwordResetToken: hashedToken
        });

        if (!rawUser) {
            return NextResponse.json({
                error: 'Invalid or expired reset token'
            }, { status: 400 });
        }

        // Check if token has expired (using raw data)
        const expiresAt = rawUser.passwordResetExpires;
        if (!expiresAt || isTokenExpired(new Date(expiresAt))) {
            // Clear expired token raw
            await User.collection.updateOne(
                { _id: rawUser._id },
                {
                    $unset: {
                        passwordResetToken: "",
                        passwordResetExpires: ""
                    }
                }
            );

            return NextResponse.json({
                error: 'Reset token has expired. Please request a new one.'
            }, { status: 400 });
        }

        // Update password and clear reset fields atomically raw
        const hashedPassword = await hashPassword(password);

        await User.collection.updateOne(
            { _id: rawUser._id },
            {
                $set: { passwordHash: hashedPassword },
                $inc: { refreshTokenVersion: 1 },
                $unset: {
                    passwordResetToken: "",
                    passwordResetExpires: ""
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
