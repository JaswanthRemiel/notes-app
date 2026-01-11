'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TextFontIcon, Image02Icon, Add01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
    onAddText: () => void;
    onUploadImage: (file: File) => void;
}

export function Toolbar({ onAddText, onUploadImage }: ToolbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
        setIsOpen(false);
    };

    const handleTextClick = () => {
        onAddText();
        setIsOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUploadImage(file);
            e.target.value = '';
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-30 flex flex-col-reverse items-center gap-3">
            {/* Main Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-transform duration-300",
                    isOpen ? "rotate-45" : "rotate-0"
                )}
            >
                <Add01Icon size={28} />
            </Button>

            {/* Floating Options */}
            <div className={cn(
                "flex flex-col gap-3 transition-all duration-300 origin-bottom",
                isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
            )}>
                <Button
                    onClick={handleImageClick}
                    variant="secondary"
                    className="h-12 w-12 rounded-full shadow-md"
                    title="Add Image"
                >
                    <Image02Icon size={20} />
                </Button>

                <Button
                    onClick={handleTextClick}
                    variant="secondary"
                    className="h-12 w-12 rounded-full shadow-md"
                    title="Add Text"
                >
                    <TextFontIcon size={20} />
                </Button>
            </div>

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
