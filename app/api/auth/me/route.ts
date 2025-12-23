import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
    const { user, error } = await getSession();

    if (!user) {
        return NextResponse.json({ authenticated: false, error }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
}
