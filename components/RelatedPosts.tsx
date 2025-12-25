import Link from 'next/link';
import Image from 'next/image';

interface Post {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
    publishedAt?: string;
    createdAt: string;
    excerpt?: string;
}

interface RelatedPostsProps {
    posts: Post[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-blue-600 pl-4">
                    Read This Next
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div key={post._id} className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {post.coverImage && (
                                <Link href={`/blog/${post.slug}`} className="block relative h-40 w-full">
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </Link>
                            )}
                            <div className="p-4 flex flex-1 flex-col">
                                <Link href={`/blog/${post.slug}`} className="block group">
                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-tight mb-2">
                                        {post.title}
                                    </h4>
                                </Link>
                                <time className="text-xs text-gray-500 mt-auto">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
