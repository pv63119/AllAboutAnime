import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import { getSession } from '@/lib/auth/session';
import { createPostSchema } from '@/lib/validations/post';
import { generateSlug } from '@/lib/utils/slug';

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'published';
    const myPosts = searchParams.get('myPosts') === 'true';
    const search = searchParams.get('search');

    let query: any = { isDeleted: false };

    // Search Filter
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { title: searchRegex },
            { excerpt: searchRegex },
            { content: searchRegex }
        ];
    }

    // If myPosts is true, get session and filter by author
    if (myPosts) {
        const session = await getSession();
        if (!session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        query.author = session.user.userId;
        // Don't filter by status for author's own posts - show all
    } else {
        // Public endpoint - only show published posts (unless it's myPosts)
        query.status = status;
    }

    const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name email');

    const total = await Post.countDocuments(query);

    return NextResponse.json({
        posts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role check: Only Author/Admin can create
        if (!['author', 'admin'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        const result = createPostSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
        }

        const data = result.data;
        const slug = data.slug || generateSlug(data.title) + '-' + Date.now().toString().slice(-4);
        // Append random string to ensure unique slug if not provided

        await dbConnect();

        // Check slug uniqueness
        const existing = await Post.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }

        const post = await Post.create({
            ...data,
            slug,
            author: session.user.userId,
        });

        return NextResponse.json({ success: true, post }, { status: 201 });
    } catch (error) {
        console.error('Create Post Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
