import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/tokens';
import { registerSchema } from '@/lib/validations/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, email, password } = result.data;

        await dbConnect();

        // Check duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash & Create
        const passwordHash = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            passwordHash,
            role: 'reader', // Default role
        });

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
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
