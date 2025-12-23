'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {success ? (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-800">
                            If an account exists with that email, a password reset link has been sent.
                            Please check your inbox (and spam folder).
                        </p>
                        <Link
                            href="/login"
                            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            ← Back to login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                name="email"
                                type="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="text-black"
                            />

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Send Reset Link
                            </Button>
                        </form>

                        <p className="mt-4 text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
