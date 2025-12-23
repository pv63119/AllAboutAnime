import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import '@/models/User'; // Force model registration
import { Metadata } from 'next';
import PostPreview from '@/components/PostPreview';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
    await dbConnect();
    const post = await Post.findOne({ slug, status: 'published', isDeleted: false })
        .populate('author', 'name')
        .lean();

    if (!post) return null;

    // Type casting to handle populated field type
    const postData = post as any;

    return {
        ...postData,
        _id: postData._id.toString(),
        author: { ...postData.author, _id: postData.author._id.toString() },
        createdAt: postData.createdAt.toISOString(),
        publishedAt: postData.publishedAt?.toISOString(),
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${post.title} | AllAboutAnime`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <div>
            <PostPreview
                title={post.title}
                content={post.content}
                coverImage={post.coverImage}
                authorName={post.author?.name}
                createdAt={post.createdAt}
            />

            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
                    <p className="mt-4 text-gray-500">Comments section integration coming soon.</p>
                </div>
            </div>
        </div>
    );
}
