import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SignupForm } from '@/components/auth/SignupForm';
import { DotPattern } from '@/components/ui/DotPattern';

export default function SignupPage() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
                    <DotPattern className="absolute inset-x-0 inset-y-0 h-full w-full opacity-50" />
                    <div className="relative z-10 w-full max-w-[350px]">
                        <SignupForm />
                    </div>
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}
