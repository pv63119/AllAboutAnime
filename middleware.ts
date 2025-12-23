import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';

const PROTECTED_ROUTES = [
    { path: '/admin', role: 'admin' },
    { path: '/author', role: 'author' }, // Author can access /author/*
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Identify if route needs protection
    const requiredRole = PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));

    if (!requiredRole) {
        return NextResponse.next();
    }

    // 2. Check Auth
    // 2. Check Auth
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    let userRole: string | undefined;

    // Try Access Token first
    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload) {
            userRole = payload.role;
        }
    }

    // If Access Token is invalid/expired, try Refresh Token
    if (!userRole && refreshToken) {
        // We import verifyRefreshToken for this check
        const { verifyRefreshToken } = await import('@/lib/auth/tokens');
        const payload = await verifyRefreshToken(refreshToken);
        if (payload && payload.role) {
            userRole = payload.role;
        }
    }

    // If still no userRole, redirect to login
    if (!userRole) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Check Permissions
    if (requiredRole.role === 'admin' && userRole !== 'admin') {
        return NextResponse.rewrite(new URL('/403', request.url));
    }

    if (requiredRole.role === 'author' && !['admin', 'author'].includes(userRole)) {
        return NextResponse.rewrite(new URL('/403', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/author/:path*'],
};
