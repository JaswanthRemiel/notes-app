'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div style={{ marginBottom: '16px' }}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)'
                    }}
                >
                    {label}
                </label>
            )}
            <input
                className={`input ${error ? 'input-error' : ''} ${className}`}
                style={error ? { borderColor: 'var(--error)' } : undefined}
                {...props}
            />
            {error && (
                <p style={{
                    color: 'var(--error)',
                    fontSize: '12px',
                    marginTop: '4px'
                }}>
                    {error}
                </p>
            )}
        </div>
    );
}
