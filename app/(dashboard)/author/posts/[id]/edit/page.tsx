import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import PostEditor from '@/components/PostEditor';
import { Types } from 'mongoose';

interface Props {
    params: Promise<{ id: string }>;
}

async function getPost(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;

    await dbConnect();
    const post = await Post.findById(id).lean();

    if (!post) return null;

    const postData = post as any;

    return {
        ...postData,
        _id: postData._id.toString(),
        author: postData.author.toString(),
        createdAt: postData.createdAt.toISOString(),
        updatedAt: postData.updatedAt.toISOString(),
        publishedAt: postData.publishedAt?.toISOString(),
    };
}

export default async function EditPostPage({ params }: Props) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="h-full">
            <PostEditor initialData={post} isEditing={true} />
        </div>
    );
}
