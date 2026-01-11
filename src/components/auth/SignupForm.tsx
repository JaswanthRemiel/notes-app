'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function SignupForm() {
    const router = useRouter();
    const { signup } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setLoading(true);

        try {
            await signup(username, password);
            router.push('/moodboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create account');
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
                placeholder="Choose a username"
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
            <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
            />
            {error && (
                <p style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px' }}>
                    {error}
                </p>
            )}
            <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
                Create Account
            </Button>
            <p style={{
                textAlign: 'center',
                marginTop: '20px',
                color: 'var(--text-secondary)',
                fontSize: '14px'
            }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    Sign in
                </Link>
            </p>
        </form>
    );
}
