'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoodboardItem } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface CountdownBlockProps {
    item: MoodboardItem;
    onUpdate: (id: string, data: Partial<MoodboardItem>) => void;
    onDelete: (id: string) => void;
    zoom: number;
    pan: { x: number; y: number };
    zIndex: number;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const total = target - now;

    if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((total % (1000 * 60)) / 1000),
        total
    };
}

export function CountdownBlock({ item, onUpdate, onDelete, zoom, pan, zIndex }: CountdownBlockProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const blockRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const isMouseDown = useRef(false);

    const targetDate = item.content ? new Date(item.content) : null;

    useEffect(() => {
        if (!targetDate || isNaN(targetDate.getTime())) return;

        const updateCountdown = () => {
            setTimeRemaining(calculateTimeRemaining(targetDate));
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [item.content]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.calendar-popover')) return;

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

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onUpdate(item.$id, { content: date.toISOString() });
            setIsCalendarOpen(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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

    const isExpired = timeRemaining && timeRemaining.total <= 0;
    const hasValidDate = targetDate && !isNaN(targetDate.getTime());

    return (
        <div
            ref={blockRef}
            className={cn(
                "draggable-block countdown-block absolute",
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

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <div
                        className={cn(
                            "countdown-card p-4 cursor-pointer select-none min-w-[200px] transition-all duration-200 rounded-lg",
                            "hover:scale-[1.02]",
                            isExpired && "opacity-75"
                        )}
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 4px 12px var(--shadow)'
                        }}
                    >
                        {hasValidDate && timeRemaining ? (
                            <div className="space-y-3">
                                <div
                                    className="text-xs font-medium uppercase tracking-wider"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {isExpired ? 'Completed' : 'Countdown to'}
                                </div>
                                <div
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {formatDate(targetDate)}
                                </div>

                                {!isExpired ? (
                                    <div className="grid grid-cols-4 gap-2 pt-2">
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold tabular-nums"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {timeRemaining.days}
                                            </div>
                                            <div
                                                className="text-[10px] uppercase"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Days
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold tabular-nums"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {String(timeRemaining.hours).padStart(2, '0')}
                                            </div>
                                            <div
                                                className="text-[10px] uppercase"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Hrs
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold tabular-nums"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {String(timeRemaining.minutes).padStart(2, '0')}
                                            </div>
                                            <div
                                                className="text-[10px] uppercase"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Min
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold tabular-nums"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {String(timeRemaining.seconds).padStart(2, '0')}
                                            </div>
                                            <div
                                                className="text-[10px] uppercase"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                Sec
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-2">
                                        <div
                                            className="text-lg font-semibold"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            🎉 Complete!
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4 space-y-2">
                                <div className="text-3xl">📅</div>
                                <div
                                    className="text-sm"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Click to set date
                                </div>
                            </div>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="calendar-popover w-auto p-0"
                    align="start"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Calendar
                        mode="single"
                        selected={targetDate || undefined}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
