import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/tokens';
import { loginSchema } from '@/lib/validations/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        await dbConnect();

        // Find User
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify Password
        const isValid = await verifyPassword(user.passwordHash, password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate Tokens
        const accessToken = await signAccessToken({ userId: user._id.toString(), role: user.role });
        const refreshToken = await signRefreshToken({ userId: user._id.toString(), version: user.refreshTokenVersion, role: user.role });

        // Set Cookies
        (await cookies()).set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15m
            path: '/',
        });

        (await cookies()).set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7d
            path: '/',
        });

        return NextResponse.json(
            { success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
