'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import UserAvatar from '@/components/UserAvatar';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, checkSession } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setUsername(user.username || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username }),
            });

            if (res.ok) {
                await checkSession(); // Refresh session to get new details
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    // Helper to capitalize role
    const capitalize = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    // Helper for banner color
    const getBannerGradient = (role?: string) => {
        switch (role) {
            case 'admin':
                return 'from-red-500 to-red-600';
            case 'author':
                return 'from-green-500 to-green-600';
            default: // reader
                return 'from-blue-500 to-blue-600';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100">
                <div className={`bg-gradient-to-r ${getBannerGradient(user?.role)} p-8 flex items-end`}>
                    <div className="flex items-center gap-6">
                        <div className="p-1 bg-white/20 backdrop-blur-sm rounded-full">
                            <UserAvatar
                                name={user?.name}
                                className="w-24 h-24 text-3xl border-4 border-white/20"
                            />
                        </div>
                        <div className="mb-2">
                            <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-white/90 font-medium text-lg">@{user?.username || 'no-username'}</p>
                                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-0.5 text-xs font-medium text-white border border-white/30">
                                    {capitalize(user?.role)}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                            <p className="text-gray-900 font-medium">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500">User ID</label>
                            <p className="text-gray-500 font-mono text-sm">{user?.userId}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {
                isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">Edit Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">@</span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-black focus:border-blue-500 focus:outline-none"
                                            placeholder="unique_username"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Must be unique, 3-20 characters.</p>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsEditing(false)}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" isLoading={saving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
