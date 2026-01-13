'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoodboardItem } from '@/types';
import { File02Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { getFileIdFromUrl, getFileDownloadUrl } from '@/lib/storage';

interface FileBlockProps {
    item: MoodboardItem;
    onUpdate: (id: string, data: Partial<MoodboardItem>) => void;
    onDelete: (id: string) => void;
    zoom: number;
    pan: { x: number; y: number };
    zIndex: number;
}

export function FileBlock({ item, onUpdate, onDelete, zoom, pan, zIndex }: FileBlockProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const blockRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const isMouseDown = useRef(false);

    // Parse style to get filename
    const style = item.style ? JSON.parse(item.style) : {};
    const fileName = style.fileName || 'Unknown file';

    // Truncate filename if too long
    const displayName = fileName.length > 20
        ? fileName.substring(0, 17) + '...' + fileName.substring(fileName.lastIndexOf('.'))
        : fileName;

    const handleMouseDown = (e: React.MouseEvent) => {
        isMouseDown.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };

        const rect = blockRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isMouseDown.current) return;

        if (!isDragging) {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            if (Math.hypot(dx, dy) > 5) {
                setIsDragging(true);
            } else {
                return;
            }
        }

        const canvas = document.getElementById('moodboard-canvas');
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const newX = (e.clientX - canvasRect.left - pan.x) / zoom - dragOffset.current.x / zoom;
        const newY = (e.clientY - canvasRect.top - pan.y) / zoom - dragOffset.current.y / zoom;

        if (blockRef.current) {
            blockRef.current.style.left = `${newX}px`;
            blockRef.current.style.top = `${newY}px`;
        }
    };

    const handleMouseUp = () => {
        if (!isMouseDown.current) return;

        isMouseDown.current = false;

        if (isDragging) {
            setIsDragging(false);
            if (blockRef.current) {
                const left = parseInt(blockRef.current.style.left);
                const top = parseInt(blockRef.current.style.top);
                onUpdate(item.$id, { positionX: left, positionY: top });
            }
        } else {
            // Click - download file
            handleDownload();
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleDownload = () => {
        const fileId = getFileIdFromUrl(item.content);
        if (fileId) {
            const downloadUrl = getFileDownloadUrl(fileId);
            window.open(downloadUrl, '_blank');
        } else {
            // Fallback to direct URL
            window.open(item.content, '_blank');
        }
    };

    const deleteButton = (
        <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.$id); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute -top-3 -right-3 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full text-white flex items-center justify-center text-sm z-50 transition-colors"
        >
            ×
        </button>
    );

    return (
        <div
            ref={blockRef}
            className={cn(
                "draggable-block file-block absolute",
                isDragging && "opacity-80 cursor-grabbing"
            )}
            style={{
                left: item.positionX,
                top: item.positionY,
                zIndex: isDragging ? 1000 : zIndex,
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && !isDragging && deleteButton}

            <div
                className={cn(
                    "file-card p-4 cursor-pointer select-none transition-all duration-200 rounded-lg",
                    "hover:scale-[1.02]",
                    "flex items-center gap-3"
                )}
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 12px var(--shadow)',
                    minWidth: '160px',
                    maxWidth: '220px'
                }}
            >
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg-tertiary)' }}
                >
                    <File02Icon size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                        title={fileName}
                    >
                        {displayName}
                    </div>
                    <div
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Click to download
                    </div>
                </div>
            </div>
        </div>
    );
}
