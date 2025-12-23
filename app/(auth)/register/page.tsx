'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle validation errors array if present
                if (data.details) {
                    throw new Error(data.details[0].message);
                }
                throw new Error(data.error || 'Registration failed');
            }

            // Registration successful, auto-login
            login({ userId: data.user.id, role: data.user.role, name: data.user.name, email: data.user.email });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h1>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="name"
                        type="text"
                        label="Full Name"
                        placeholder="Full Name"
                        required
                        autoComplete="name"
                        className='text-black'
                    />
                    <Input
                        name="email"
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className='text-black'
                    />
                    <Input
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        minLength={6}
                        className='text-black'
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Sign Up
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
