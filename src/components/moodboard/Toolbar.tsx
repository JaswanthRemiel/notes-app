'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/Button';

import { TextFontIcon, Image02Icon } from 'hugeicons-react';

interface ToolbarProps {
    onAddText: () => void;
    onUploadImage: (file: File) => void;
}

export function Toolbar({ onAddText, onUploadImage }: ToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadImage(file);
            e.target.value = '';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            padding: '12px 20px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 32px var(--shadow-lg)',
            zIndex: 30
        }}>
            <Button onClick={onAddText} variant="secondary" title="Add Text">
                <TextFontIcon size={24} />
            </Button>
            <Button onClick={handleImageClick} variant="secondary" title="Add Image">
                <Image02Icon size={24} />
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}
