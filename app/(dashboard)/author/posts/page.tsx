'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Post {
    _id: string;
    title: string;
    slug: string;
    status: string;
    content?: string;
    tags?: string[];
    coverImage?: string;
}

export default function AuthorPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = () => {
        fetch('/api/posts?myPosts=true')
            .then((res) => res.json())
            .then((data) => {
                if (data.posts) setPosts(data.posts);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPosts();
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            alert('Error deleting post');
        }
    };

    return (
        <div>


            <div className="rounded-xl bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No posts found. Start writing!</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <table className="hidden md:table min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {posts.map((post) => (
                                    <tr key={post._id}>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-black">{post.title}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-black">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <Link
                                                href={`/author/posts/${post._id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 divide-y divide-gray-200">
                            {posts.map((post) => (
                                <div key={post._id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-medium text-gray-900">{post.title}</h3>
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Link
                                            href={`/author/posts/${post._id}/edit`}
                                            className="flex-1 text-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
