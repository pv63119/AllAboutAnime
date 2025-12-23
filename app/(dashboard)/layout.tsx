'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    const isActive = (path: string) => pathname === path;
    const baseLinkClass = "block border-l-4 px-6 py-3 transition-colors duration-200";
    const activeClass = "bg-blue-50 border-blue-500 text-blue-700 font-medium";
    const inactiveClass = "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900";

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-6 flex justify-between items-center">
                    <Link href="/">
                        <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 cursor-pointer">AllAboutAnime</h2>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 pb-4 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-700 truncate">{user.name || 'User'}</p>
                </div>
                <nav className="mt-2 space-y-1">
                    <Link
                        href="/dashboard"
                        className={`${baseLinkClass} ${isActive('/dashboard') ? activeClass : inactiveClass}`}
                    >
                        Overview
                    </Link>

                    {user.role === 'admin' && (
                        <>
                            <Link
                                href="/admin/dashboard"
                                className={`${baseLinkClass} ${isActive('/admin/dashboard') ? activeClass : inactiveClass}`}
                            >
                                Admin Dashboard
                            </Link>
                            <Link
                                href="/admin/users"
                                className={`${baseLinkClass} ${isActive('/admin/users') ? activeClass : inactiveClass}`}
                            >
                                Manage Users
                            </Link>
                        </>
                    )}

                    {['admin', 'author'].includes(user.role) && (
                        <Link
                            href="/author/posts"
                            className={`${baseLinkClass} ${isActive('/author/posts') ? activeClass : inactiveClass}`}
                        >
                            My Posts
                        </Link>
                    )}

                    <div className="border-t border-gray-100 mt-6 pt-2">
                        <button
                            onClick={() => logout()}
                            className="w-full text-left border-l-4 border-transparent px-6 py-3 text-red-600 hover:bg-red-50 hover:border-red-500 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {pathname.includes('/create') ? 'Create Post' :
                                pathname.includes('/edit') ? 'Edit Post' :
                                    pathname.includes('/admin') ? 'Administration' :
                                        pathname.includes('/author/posts') ? 'My Posts' :
                                            'Dashboard'}
                        </h2>
                    </div>

                    {['admin', 'author'].includes(user.role) && (
                        <Link href="/author/posts/create">
                            <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                                <span className="hidden sm:inline">+ Create Post</span>
                                <span className="sm:hidden">+</span>
                            </button>
                        </Link>
                    )}
                </header>

                <div className="p-4 sm:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
