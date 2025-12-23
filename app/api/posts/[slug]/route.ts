import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import { getSession } from '@/lib/auth/session';
import { updatePostSchema } from '@/lib/validations/post';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    // slug param here might be SLUG or ID. 
    // Since we want robust looking up:
    // If it matches ObjectId regex, try ID. Else try Slug.

    const { slug } = await params;
    await dbConnect();

    let post = await Post.findOne({ slug, isDeleted: false }).populate('author', 'name email');

    if (!post) {
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            post = await Post.findOne({ _id: slug, isDeleted: false }).populate('author', 'name email');
        }
    }

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getSession();
        if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { slug } = await params;
        await dbConnect();

        // Find Post (by ID or Slug)
        let post = await Post.findOne({ slug, isDeleted: false });
        if (!post && slug.match(/^[0-9a-fA-F]{24}$/)) {
            post = await Post.findOne({ _id: slug, isDeleted: false });
        }

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        // RBAC: Admin can edit any. Author can edit OWN.
        if (session.user.role !== 'admin' && post.author.toString() !== session.user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const result = updatePostSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.flatten().fieldErrors }, { status: 400 });
        }

        post.set(result.data);
        await post.save();

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error('Update Post Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getSession();
        if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { slug } = await params;
        await dbConnect();

        let post = await Post.findOne({ slug, isDeleted: false });
        if (!post && slug.match(/^[0-9a-fA-F]{24}$/)) {
            post = await Post.findOne({ _id: slug, isDeleted: false });
        }

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

        // RBAC: Admin can delete any. Author can delete OWN.
        if (session.user.role !== 'admin' && post.author.toString() !== session.user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Soft Delete
        post.isDeleted = true;
        await post.save();

        return NextResponse.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete Post Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
