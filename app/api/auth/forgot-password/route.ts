import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { generateResetToken, hashResetToken, getTokenExpiration } from '@/lib/auth/password-reset';
import { sendPasswordResetEmail } from '@/lib/email/nodemailer';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success for security (don't reveal if email exists)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If that email exists, a reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const hashedToken = hashResetToken(resetToken);

        // Use User.collection to bypass Mongoose schema validation/filtering
        // This ensures the token is correctly persisted even if the model is stale in memory
        await User.collection.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: getTokenExpiration()
                }
            }
        );

        // Send email with plain token (not hashed)
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Clear the token if email fails
            await User.collection.findOneAndUpdate(
                { _id: user._id },
                {
                    $unset: {
                        passwordResetToken: "",
                        passwordResetExpires: ""
                    }
                }
            );
            return NextResponse.json({
                error: 'Failed to send reset email. Please try again.'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'If that email exists, a reset link has been sent'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
