'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Stats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
}

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app, you'd have a specific stats API
                // For now, we'll fetch users count and posts count
                const [usersRes, postsRes] = await Promise.all([
                    fetch('/api/users'),
                    fetch('/api/posts'),
                ]);

                const usersData = await usersRes.json();
                const postsData = await postsRes.json();

                setStats({
                    totalUsers: usersData.users?.length || 0,
                    totalPosts: postsData.posts?.length || 0,
                    totalComments: 0, // Not implemented yet
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* User Stats */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalUsers}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Post Stats */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Posts</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalPosts}</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3 text-green-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v4a2 2 0 002 2h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-center space-y-3">
                    <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
                    <div className="flex space-x-2">
                        <Link href="/admin/users" className="flex-1">
                            <Button className="w-full text-xs" variant="secondary">Manage Users</Button>
                        </Link>
                        <Link href="/author/posts" className="flex-1">
                            <Button className="w-full text-xs" variant="secondary">All Posts</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-xl bg-blue-50 p-6 border border-blue-100">
                <h2 className="text-lg font-semibold text-blue-900">Platform Overview</h2>
                <p className="mt-2 text-blue-700">
                    Welcome to the central command center. From here you can monitor user growth, content velocity, and manage overall platform settings.
                </p>
            </div>
        </div>
    );
}
