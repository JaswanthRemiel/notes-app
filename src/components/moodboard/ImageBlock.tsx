'use client';

import React, { useState, useRef } from 'react';
import { MoodboardItem } from '@/types';
import Image from 'next/image';

interface ImageBlockProps {
    item: MoodboardItem;
    onUpdate: (id: string, data: Partial<MoodboardItem>) => void;
    onDelete: (id: string) => void;
}

export function ImageBlock({ item, onUpdate, onDelete }: ImageBlockProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const blockRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

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
        const newX = e.clientX - canvasRect.left - dragOffset.current.x;
        const newY = e.clientY - canvasRect.top - dragOffset.current.y;

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

    return (
        <div
            ref={blockRef}
            className={`draggable-block ${isDragging ? 'dragging' : ''}`}
            style={{
                left: item.positionX,
                top: item.positionY,
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="polaroid" style={{ position: 'relative' }}>
                {/* Tape decoration */}
                <div className="tape" />

                {/* Delete button - only visible on hover */}
                {isHovered && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.$id); }}
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
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
                )}

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
        </div>
    );
}
