import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import Post from '@/models/Post';
import '@/models/User';
import { Metadata } from 'next';
import Link from 'next/link';
import PostPreview from '@/components/PostPreview';
import Breadcrumbs from '@/components/Breadcrumbs';
import ScrollToTop from '@/components/ScrollToTop';

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

async function getRelatedPosts(currentPostId: string, tags: string[] = [], categories: string[] = []) {
    await dbConnect();

    // Build query conditions
    const matchConditions: any[] = [];
    if (tags && tags.length > 0) matchConditions.push({ tags: { $in: tags } });
    if (categories && categories.length > 0) matchConditions.push({ categories: { $in: categories } });

    // If no tags or categories, return empty array to avoid fetching random posts (or fallback to recent)
    if (matchConditions.length === 0) {
        return await Post.find({
            _id: { $ne: currentPostId },
            status: 'published',
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('title slug coverImage publishedAt createdAt excerpt')
            .lean()
            .then(posts => posts.map(serializePost));
    }

    let posts = await Post.find({
        _id: { $ne: currentPostId },
        status: 'published',
        isDeleted: false,
        $or: matchConditions
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title slug coverImage publishedAt createdAt excerpt')
        .lean();

    // Fallback: If no related posts found by tags/categories, fetch recent posts
    if (posts.length === 0) {
        posts = await Post.find({
            _id: { $ne: currentPostId },
            status: 'published',
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('title slug coverImage publishedAt createdAt excerpt')
            .lean();
    }

    return posts.map(serializePost);
}

function serializePost(post: any) {
    return {
        ...post,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        publishedAt: post.publishedAt?.toISOString(),
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

async function getRecentPosts(currentPostId: string) {
    await dbConnect();
    const posts = await Post.find({
        _id: { $ne: currentPostId },
        status: 'published',
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug coverImage createdAt')
        .lean();

    return posts.map(serializePost);
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const [relatedPosts, recentPosts] = await Promise.all([
        getRelatedPosts(post._id, post.tags, post.categories),
        getRecentPosts(post._id)
    ]);

    return (
        <div>
            <ScrollToTop />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumbs */}
                <div className="mb-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/' },
                            { label: post.title, href: `/blog/${post.slug}`, isCurrent: true },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <PostPreview
                            title={post.title}
                            content={post.content}
                            coverImage={post.coverImage}
                            authorName={post.author?.name}
                            createdAt={post.createdAt}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-4 pr-2 custom-scrollbar">

                            {/* 1. Read This Next */}
                            {relatedPosts.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                                        Read This Next
                                    </h3>
                                    <ul className="space-y-2">
                                        {relatedPosts.map((relatedPost: any) => (
                                            <li key={relatedPost._id}>
                                                <Link href={`/blog/${relatedPost.slug}`} className="group block">
                                                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                                        {relatedPost.title}
                                                    </h4>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 2. Start Watching */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                    Start Watching
                                </h3>
                                <ul className="space-y-2">
                                    {[
                                        { title: 'Top 10 Anime for Beginners', href: '#' },
                                        { title: 'Understanding Anime Genres', href: '#' },
                                        { title: 'How to Watch Anime Legal', href: '#' },
                                    ].map((item) => (
                                        <li key={item.title}>
                                            <Link href={item.href} className="group block">
                                                <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h4>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* 3. Recently Added */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                                    Recently Added
                                </h3>
                                <ul className="space-y-2">
                                    {recentPosts.length > 0 ? (
                                        recentPosts.map((recentPost: any) => (
                                            <li key={recentPost._id}>
                                                <Link href={`/blog/${recentPost.slug}`} className="group block">
                                                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                                        {recentPost.title}
                                                    </h4>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 text-xs italic">No recent posts.</li>
                                    )}
                                </ul>
                            </div>

                            {/* 4. Watch Orders */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                                    Watch Orders
                                </h3>
                                <ul className="space-y-2">
                                    {[
                                        { title: 'Fate Series Watch Order', href: '#' },
                                        { title: 'Monogatari Series Order', href: '#' },
                                        { title: 'Gundam Universe Guide', href: '#' },
                                    ].map((item) => (
                                        <li key={item.title}>
                                            <Link href={item.href} className="group block">
                                                <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h4>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* Comments section removed as per user request */}
        </div>
    );
}
