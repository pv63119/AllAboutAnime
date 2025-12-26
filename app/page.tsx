import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import '@/models/User'; // Force model registration
import UserAvatar from '@/components/UserAvatar';
import { getPostExcerpt } from '@/lib/utils/format';

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
        excerpt: getPostExcerpt(post.content, post.excerpt),
        _id: post._id.toString(),
        author: { ...post.author, _id: post.author._id.toString() },
        createdAt: post.createdAt.toISOString(),
    }));
}

async function getTrendingPosts() {
    await dbConnect();
    const posts = await Post.find({
        status: 'published',
        isDeleted: false,
        tags: 'trending'
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title slug')
        .lean();

    return posts.map(post => ({
        ...post,
        _id: post._id.toString(),
    }));
}

async function getWatchOrders() {
    await dbConnect();
    const posts = await Post.find({
        status: 'published',
        isDeleted: false,
        tags: { $regex: /watch[- ]order/i }
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title slug')
        .lean();

    return posts.map(post => ({
        ...post,
        _id: post._id.toString(),
    }));
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
    const [posts, trendingPosts, watchOrders] = await Promise.all([
        getPosts(),
        getTrendingPosts(),
        getWatchOrders()
    ]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
                        AllAboutAnime – Anime Guides, Watch Orders & Deep Dives
                    </h1>
                    <p className="mx-auto max-w-md text-lg sm:text-xl md:max-w-3xl md:text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Anime guides, watch orders, rankings & deep dives — from first episode to final arc.
                    </p>
                    <p className="mx-auto max-w-md text-base text-gray-500 sm:text-lg md:max-w-3xl md:text-xl">
                        Welcome to AllAboutAnime, your home for anime guides, watch orders, rankings, and in-depth analysis. Whether you’re starting your very first anime, searching for the correct watch order for a long-running series, or diving deeper into popular arcs and characters, you’ll find clear guides and honest fan-driven insights here.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <h2 className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                            Latest Articles
                        </h2>
                        {posts.length > 0 ? (
                            posts.map((post: any, index: number) => (
                                <div key={post._id} className="flex flex-col overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100 transition-all hover:shadow-xl duration-300">
                                    {post.coverImage && (
                                        <Link href={`/blog/${post.slug}`} className="cursor-pointer group overflow-hidden">
                                            <div className="h-80 w-full relative">
                                                <Image
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    priority={index < 2}
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
                                                    {post.excerpt}
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
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {/* Trending Widget */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                                    Trending
                                </h3>
                                <ul className="space-y-2">
                                    {trendingPosts.length > 0 ? (
                                        trendingPosts.map((item: any) => (
                                            <li key={item._id}>
                                                <Link href={`/blog/${item.slug}`} className="group block">
                                                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0 group-hover:bg-blue-600 transition-colors" />
                                                        <span>{item.title}</span>
                                                    </h4>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 text-xs italic">No trending posts.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Watch Order Widget */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                                    Watch Orders
                                </h3>
                                <ul className="space-y-2">
                                    {watchOrders.length > 0 ? (
                                        watchOrders.map((item: any) => (
                                            <li key={item._id}>
                                                <Link href={`/blog/${item.slug}`} className="group block">
                                                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0 group-hover:bg-blue-600 transition-colors" />
                                                        <span>{item.title}</span>
                                                    </h4>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 text-xs italic">No watch orders found.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                                    Recently Added
                                </h3>
                                <ul className="space-y-2">
                                    {posts.slice(0, 5).map((post: any) => (
                                        <li key={post._id} className="group">
                                            <Link href={`/blog/${post.slug}`} className="block">
                                                <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0 group-hover:bg-blue-600 transition-colors" />
                                                    <span>{post.title}</span>
                                                </h4>
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
        </div>
    );
}
