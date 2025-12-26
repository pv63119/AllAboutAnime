'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import { useState } from 'react';

export default function Navbar() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Hide navbar on dashboard-like layouts
    if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/author')
    ) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                        >
                            AllAboutAnime
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-4 pr-10 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {!loading && (
                            <>
                                {user ? (
                                    <>
                                        {['admin', 'author'].includes(user.role) && (
                                            <Link
                                                href="/author/posts/create"
                                                className="hidden sm:inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors mr-2"
                                            >
                                                Create Post
                                            </Link>
                                        )}
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center gap-2 rounded-lg py-1 pl-1 pr-3 hover:bg-gray-100 transition-colors"
                                        >
                                            <UserAvatar name={user.name || user.email || 'User'} className="h-8 w-8 text-sm" />
                                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                                {user.name || 'Dashboard'}
                                            </span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                        >
                                            Log in
                                        </Link>

                                        <Link
                                            href="/register"
                                            className="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
