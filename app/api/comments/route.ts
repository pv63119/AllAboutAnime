import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import { getSession } from '@/lib/auth/session';
import { createCommentSchema } from '@/lib/validations/comment';

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
        return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const comments = await Comment.find({ post: postId, isDeleted: false })
        .sort({ createdAt: -1 })
        .populate('author', 'name');

    return NextResponse.json({ comments });
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const result = createCommentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { content, postId } = result.data;
        await dbConnect();

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const comment = await Comment.create({
            content,
            post: postId,
            author: session.user.userId,
        });

        return NextResponse.json({ success: true, comment }, { status: 201 });
    } catch (error) {
        console.error('Create Comment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
