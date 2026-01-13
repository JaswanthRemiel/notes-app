'use client';

import React, { useState, useRef } from 'react';
import { MoodboardItem } from '@/types';
import Image from 'next/image';

interface ImageBlockProps {
    item: MoodboardItem;
    onUpdate: (id: string, data: Partial<MoodboardItem>) => void;
    onDelete: (id: string) => void;
    zoom: number;
    pan: { x: number; y: number };
    zIndex: number;
}

export function ImageBlock({ item, onUpdate, onDelete, zoom, pan, zIndex }: ImageBlockProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const blockRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Parse style config
    const style = item.style ? JSON.parse(item.style) : {};
    const isFramed = style.framed !== false; // Default to true for backward compatibility

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const rect = blockRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const canvas = document.getElementById('moodboard-canvas');
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        // Convert screen coordinates to canvas coordinates accounting for zoom and pan
        const newX = (e.clientX - canvasRect.left - pan.x) / zoom - dragOffset.current.x / zoom;
        const newY = (e.clientY - canvasRect.top - pan.y) / zoom - dragOffset.current.y / zoom;

        if (blockRef.current) {
            blockRef.current.style.left = `${newX}px`;
            blockRef.current.style.top = `${newY}px`;
        }
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        setIsDragging(false);

        if (blockRef.current) {
            const left = parseInt(blockRef.current.style.left);
            const top = parseInt(blockRef.current.style.top);
            onUpdate(item.$id, { positionX: left, positionY: top });
        }
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const deleteButton = (
        <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.$id); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                top: isFramed ? '4px' : '-12px',
                right: isFramed ? '4px' : '-12px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
            }}
        >
            ×
        </button>
    );

    return (
        <div
            ref={blockRef}
            className={`draggable-block ${isDragging ? 'dragging' : ''}`}
            style={{
                left: item.positionX,
                top: item.positionY,
                zIndex: isDragging ? 1000 : zIndex,
                position: 'absolute'
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isFramed ? (
                <div className="polaroid" style={{ position: 'relative' }}>
                    {/* Tape decoration */}
                    <div className="tape" />

                    {/* Delete button - only visible on hover */}
                    {isHovered && deleteButton}

                    {/* Image */}
                    <div style={{
                        width: '200px',
                        height: '200px',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0'
                    }}>
                        <Image
                            src={item.content}
                            alt="Moodboard image"
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized
                        />
                    </div>
                </div>
            ) : (
                <div style={{ position: 'relative', width: '200px', height: 'auto' }}>
                    {/* Delete button - only visible on hover */}
                    {isHovered && deleteButton}

                    <img
                        src={item.content}
                        alt="Moodboard image"
                        style={{
                            maxWidth: '100%',
                            display: 'block',
                            pointerEvents: 'none', // Prevent default image drag
                            userSelect: 'none'
                        }}
                    />
                </div>
            )}
        </div>
    );
}
