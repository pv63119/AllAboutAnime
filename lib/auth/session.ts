import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from './tokens';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';

export async function getSession() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // 1. Check Access Token
    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
            // Fetch user details from DB to get name and email
            await dbConnect();
            const user = await User.findById(payload.userId).select('name email username role');
            if (user) {
                return {
                    user: {
                        userId: user._id.toString(),
                        role: user.role,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    },
                    error: null
                };
            }
        }
    }

    // 2. Refresh Token Fallback
    if (!refreshToken) {
        return { user: null, error: 'No tokens found' };
    }

    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (!refreshPayload) {
        return { user: null, error: 'Invalid refresh token' };
    }

    // 3. Check DB for Refresh Token Version (Security)
    await dbConnect();
    const user = await User.findById(refreshPayload.userId);

    if (!user || user.refreshTokenVersion !== refreshPayload.version) {
        return { user: null, error: 'Session invalidated' };
    }

    // 4. Rotate Tokens
    const newAccessToken = await signAccessToken({ userId: user._id.toString(), role: user.role });
    const newRefreshToken = await signRefreshToken({ userId: user._id.toString(), version: user.refreshTokenVersion, role: user.role });

    // Update Cookies
    cookieStore.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60,
        path: '/',
    });

    cookieStore.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
    });

    return {
        user: {
            userId: user._id.toString(),
            role: user.role,
            name: user.name,
            username: user.username,
            email: user.email
        },
        error: null
    };
}
