import { SignJWT, jwtVerify } from 'jose';

// Using jose for Edge compatibility/Middleware support.

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);

export async function signAccessToken(payload: { userId: string; role: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: { userId: string; version: number; role: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, ACCESS_SECRET);
        return payload as { userId: string; role: string };
    } catch (error) {
        return null;
    }
}

export async function verifyRefreshToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, REFRESH_SECRET);
        return payload as { userId: string; version: number; role?: string };
    } catch (error) {
        return null;
    }
}
