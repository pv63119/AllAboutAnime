import Link from 'next/link';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import '@/models/User'; // Force model registration
import UserAvatar from '@/components/UserAvatar';

async function getPosts() {
    await dbConnect();
    // Fetch only published posts
    const posts = await Post.find({ status: 'published', isDeleted: false })
        .sort({ createdAt: -1 })
        .populate('author', 'name')
        .lean(); // lean for standard JS objects

    // Serialize Mongo ID objects
    return posts.map(post => ({
        ...post,
        _id: post._id.toString(),
        author: { ...post.author, _id: post.author._id.toString() },
        createdAt: post.createdAt.toISOString(),
    }));
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
    const posts = await getPosts();

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        Your Ultimate Anime Destination
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                        News, reviews, theories, and deep dives into your favorite series from the otaku community.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
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
                                <h3 className="text-2xl font-bold text-gray-900">Nothing to watch here yet...</h3>
                                <p className="text-gray-500 mt-2">Be the first to share your anime thoughts!</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Recently Added
                            </h3>
                            <ul className="space-y-4">
                                {posts.slice(0, 10).map((post: any) => (
                                    <li key={post._id} className="group">
                                        <Link href={`/blog/${post.slug}`} className="block">
                                            <h4 className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                                {post.title}
                                            </h4>
                                            <time className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </time>
                                        </Link>
                                    </li>
                                ))}
                                {posts.length === 0 && (
                                    <li className="text-gray-500 text-sm italic">No recent posts.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
