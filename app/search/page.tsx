import Link from 'next/link';
import Post from '@/models/Post';
import '@/models/User'; // Force model registration
import UserAvatar from '@/components/UserAvatar';
import dbConnect from '@/lib/db/connect';

async function getSearchResults(query: string) {
    if (!query) return [];

    await dbConnect();
    const searchRegex = new RegExp(query, 'i');

    const posts = await Post.find({
        status: 'published',
        isDeleted: false,
        $or: [
            { title: searchRegex },
            { excerpt: searchRegex },
            { content: searchRegex }
        ]
    })
        .sort({ createdAt: -1 })
        .populate('author', 'name')
        .lean();

    // Serialize Mongo ID objects
    return posts.map(post => ({
        ...post,
        _id: post._id.toString(),
        author: { ...post.author, _id: post.author._id.toString() },
        createdAt: post.createdAt.toISOString(),
    }));
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams;
    const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
    const posts = await getSearchResults(query);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Search Results for "{query}"
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Found {posts.length} {posts.length === 1 ? 'result' : 'results'}
                    </p>
                </div>

                <div className="flex flex-col gap-12 max-w-4xl mx-auto">
                    {posts.length > 0 ? (
                        posts.map((post: any) => (
                            <div key={post._id} className="flex flex-col overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100 transition-all hover:shadow-xl duration-300">
                                {post.coverImage && (
                                    <Link href={`/blog/${post.slug}`} className="cursor-pointer group overflow-hidden">
                                        <div className="h-80 w-full relative">
                                            <img
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                src={post.coverImage}
                                                alt={post.title}
                                            />
                                        </div>
                                    </Link>
                                )}
                                <div className="flex flex-1 flex-col justify-between p-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {post.tags?.[0] || 'Anime'}
                                            </span>
                                            <time dateTime={post.createdAt} className="text-sm text-gray-500">
                                                {new Date(post.createdAt).toLocaleDateString(undefined, {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </time>
                                        </div>
                                        <Link href={`/blog/${post.slug}`} className="block group">
                                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                                                {post.excerpt || post.content.substring(0, 200)}...
                                            </p>
                                        </Link>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">By</span>
                                            <UserAvatar name={post.author?.name} className="h-6 w-6 text-xs" />
                                            <p className="text-sm font-medium text-gray-900">
                                                {post.author?.name || 'Unknown Author'}
                                            </p>
                                        </div>
                                        <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                                            Read Article <span aria-hidden="true" className="ml-1">&rarr;</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-medium text-gray-900">No results found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search query to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
