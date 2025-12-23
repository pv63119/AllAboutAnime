import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username cannot exceed 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional()
        .or(z.literal('')),
});

export async function PUT(req: Request) {
    try {
        const { user: sessionUser } = await getSession();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const result = updateProfileSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, username } = result.data;

        await dbConnect();

        // If username is provided and different from current, check uniqueness
        if (username && username !== sessionUser.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Username is already taken' },
                    { status: 409 }
                );
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            sessionUser.userId,
            {
                name,
                // Only set username if it's provided (not empty string if we want to allow removal? logic above implies setting it)
                // Actually, let's treat it as: if provided, set it. if empty/null, maybe don't change or unset? 
                // Schema says sparse, so null is fine. But typically users just change it.
                ...(username ? { username } : {})
            },
            { new: true }
        ).select('name email username role');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                userId: updatedUser._id.toString(),
                role: updatedUser.role,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email
            }
        });

    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
