import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
                                Welcome back
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                Sign in to your moodboard
                            </p>
                        </div>
                        <LoginForm />
                    </div>
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}
