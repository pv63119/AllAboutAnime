'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const url = query ? `/api/users?search=${encodeURIComponent(query)}` : '/api/users';
            const res = await fetch(url);
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(searchQuery);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/users?userId=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            alert('Error deleting user');
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/users?userId=${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();

            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else {
                alert(data.error || 'Failed to update role');
            }
        } catch (error) {
            alert('Error updating role');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); fetchUsers(''); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </div>

            <div className="rounded-xl bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading users...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{user.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'author' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                                        {user.role !== 'admin' && (
                                            <>
                                                {user.role === 'author' ? (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user._id, 'reader')}
                                                        className="text-orange-600 hover:text-orange-900"
                                                    >
                                                        Demote to Reader
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user._id, 'author')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Make Author
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-600 hover:text-red-900 ml-4"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
