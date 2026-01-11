'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DotPattern } from '@/components/ui/DotPattern';
import { cn } from '@/lib/utils';
import { Book03Icon, FilmRoll02Icon, LogoutSquare01Icon } from 'hugeicons-react';

function ProtectedContent({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="loading" style={{ fontSize: '18px' }}>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <DotPattern
                className={cn(
                    "[mask-image:radial-gradient(100vw_circle_at_center,white,transparent)]"
                )}
            />


            <div className="dock">
                <Link href="/moodboard">
                    <div className={`nav-item ${pathname === '/moodboard' ? 'active' : ''}`} title="Moodboard">
                        <Book03Icon size={24} />
                    </div>
                </Link>
                <Link href="/movies">
                    <div className={`nav-item ${pathname === '/movies' ? 'active' : ''}`} title="Movies">
                        <FilmRoll02Icon size={24} />
                    </div>
                </Link>


                <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 2px' }} />

                <ThemeToggle />

                <button
                    onClick={logout}
                    className="nav-item group"
                    style={{ background: 'transparent', border: 'none' }}
                    title={`Logout as ${user.name}`}
                >
                    <LogoutSquare01Icon size={24} />
                </button>
            </div>


            <main className="main-content">
                {children}
            </main>

            <style jsx global>{`

                body {
                    overflow: hidden;
                }
                .main-content {
                    margin-top: 0;
                    height: 100vh;
                }
                .nav-item:focus {
                    outline: none;
                }
            `}</style>
        </>
    );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ProtectedContent>{children}</ProtectedContent>
            </AuthProvider>
        </ThemeProvider>
    );
}
