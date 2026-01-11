'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon02Icon, Sun03Icon } from 'hugeicons-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="nav-item"
            style={{ background: 'transparent', border: 'none' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? <Moon02Icon size={24} /> : <Sun03Icon size={24} />}
        </button>
    );
}
