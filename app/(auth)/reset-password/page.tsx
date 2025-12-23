'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
                <Link
                    href="/forgot-password"
                    className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                    Request new reset link →
                </Link>
            </div>
        );
    }

    return (
        <>
            {success ? (
                <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                        Password reset successful! Redirecting to login...
                    </p>
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
                            name="password"
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            minLength={6}
                            className="text-black"
                        />
                        <Input
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            minLength={6}
                            className="text-black"
                        />

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Reset Password
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
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="mb-6 text-sm text-gray-600">
                    Enter your new password below.
                </p>

                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
