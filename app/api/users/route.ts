import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        let query: any = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query = {
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { username: searchRegex }
                ]
            };
        }

        const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('List Users Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const body = await req.json();
        const { role } = body;

        if (!userId || !role) {
            return NextResponse.json({ error: 'UserID and Role required' }, { status: 400 });
        }

        if (!['admin', 'author', 'reader'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        if (userId === session.user.userId && role !== 'admin') {
            return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
        }

        await dbConnect();
        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash');

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserID required' }, { status: 400 });
        }

        if (userId === session.user.userId) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await dbConnect();
        await User.findByIdAndDelete(userId);

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
