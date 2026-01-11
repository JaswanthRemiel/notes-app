'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            router.push('/moodboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid username or password');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
            />
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
            />
            {error && (
                <p style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px' }}>
                    {error}
                </p>
            )}
            <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
                Sign In
            </Button>
            <p style={{
                textAlign: 'center',
                marginTop: '20px',
                color: 'var(--text-secondary)',
                fontSize: '14px'
            }}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    Sign up
                </Link>
            </p>
        </form>
    );
}
