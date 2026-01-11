'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useMoodboard } from '@/hooks/useMoodboard';
import { uploadImage } from '@/lib/storage';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { Toolbar } from './Toolbar';
import { MoodboardItem } from '@/types';

interface PendingImage {
    id: string;
    localUrl: string;
    positionX: number;
    positionY: number;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export function Canvas() {
    const { items, loading, addItem, updateItem, removeItem } = useMoodboard();
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);


    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);


    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
        } else {
            setPan(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    }, []);

    const handleCanvasMouseDown = (e: React.MouseEvent) => {

        const target = e.target as HTMLElement;
        const isBackground = target.id === 'moodboard-canvas' || target.classList.contains('canvas-bg') || target.closest('.canvas-content')?.id === 'canvas-content';

        if (e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && isBackground && !target.closest('.draggable-block'))) {
            e.preventDefault();
            setIsPanning(true);
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const getCanvasPosition = useCallback((clientX: number, clientY: number) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: Math.round((clientX - rect.left - pan.x) / zoom),
            y: Math.round((clientY - rect.top - pan.y) / zoom)
        };
    }, [zoom, pan]);

    const handleAddText = async () => {

        const centerX = Math.round((window.innerWidth / 2 - pan.x) / zoom - 100 + Math.random() * 200);
        const centerY = Math.round((window.innerHeight / 2 - pan.y) / zoom - 100 + Math.random() * 200);

        await addItem({
            type: 'text',
            content: 'Click to edit...',
            positionX: centerX,
            positionY: centerY
        });
    };

    const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text');


        const urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
        if (urlPattern.test(text.trim())) {
            e.preventDefault();

            const url = text.trim().startsWith('http') ? text.trim() : `https://${text.trim()}`;
            const centerX = Math.round((window.innerWidth / 2 - pan.x) / zoom);
            const centerY = Math.round((window.innerHeight / 2 - pan.y) / zoom);


            const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">${url}</a>`;

            await addItem({
                type: 'text',
                content: linkHtml,
                positionX: centerX,
                positionY: centerY
            });
        }
    }, [addItem, pan, zoom]);

    const handleUploadImage = async (file: File) => {
        const centerX = Math.round((window.innerWidth / 2 - pan.x) / zoom - 100 + Math.random() * 200);
        const centerY = Math.round((window.innerHeight / 2 - pan.y) / zoom - 100 + Math.random() * 200);

        const localUrl = URL.createObjectURL(file);
        const pendingId = `pending-${Date.now()}`;

        setPendingImages(prev => [...prev, {
            id: pendingId,
            localUrl,
            positionX: centerX,
            positionY: centerY
        }]);

        try {
            const imageUrl = await uploadImage(file);
            await addItem({
                type: 'image',
                content: imageUrl,
                positionX: centerX,
                positionY: centerY
            });
        } catch (error) {
            console.error('Failed to upload image:', error);
        } finally {
            setPendingImages(prev => prev.filter(p => p.id !== pendingId));
            URL.revokeObjectURL(localUrl);
        }
    };

    const handleUpdate = async (id: string, data: Partial<MoodboardItem>) => {
        await updateItem(id, data);
    };

    const handleDelete = async (id: string) => {
        await removeItem(id);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
    const handleZoomOut = () => setZoom(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
    const handleResetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleFitToScreen = () => {
        if (items.length === 0) {
            handleResetZoom();
            return;
        }


        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        items.forEach(item => {
            const width = item.type === 'image' ? 240 : 250;
            const height = item.type === 'image' ? 280 : 150;

            minX = Math.min(minX, item.positionX);
            minY = Math.min(minY, item.positionY);
            maxX = Math.max(maxX, item.positionX + width);
            maxY = Math.max(maxY, item.positionY + height);
        });


        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;


        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 64;

        const zoomX = viewportWidth / contentWidth;
        const zoomY = viewportHeight / contentHeight;
        const newZoom = Math.min(Math.max(MIN_ZOOM, Math.min(zoomX, zoomY, 1)), MAX_ZOOM);


        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const newPanX = viewportWidth / 2 - centerX * newZoom;
        const newPanY = viewportHeight / 2 - centerY * newZoom;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    };

    if (loading) {
        return (
            <div style={{
                height: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="loading">Loading moodboard...</div>
            </div>
        );
    }

    return (
        <div
            ref={canvasRef}
            id="moodboard-canvas"
            className="canvas-bg"
            tabIndex={0}
            style={{
                position: 'relative',
                width: '100%',
                height: 'calc(100vh - 64px)',
                overflow: 'hidden',
                cursor: isPanning ? 'grabbing' : 'default',
                outline: 'none'
            }}
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onPaste={handlePaste}
        >

            <div
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    position: 'absolute',
                    width: '5000px',
                    height: '5000px'
                }}
            >

                {items.map((item) => (
                    item.type === 'text' ? (
                        <TextBlock
                            key={item.$id}
                            item={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <ImageBlock
                            key={item.$id}
                            item={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    )
                ))}


                {pendingImages.map((pending) => (
                    <div
                        key={pending.id}
                        className="draggable-block"
                        style={{
                            position: 'absolute',
                            left: pending.positionX,
                            top: pending.positionY,
                        }}
                    >
                        <div className="polaroid" style={{ position: 'relative', opacity: 0.7 }}>
                            <div className="tape" />
                            <div style={{
                                width: '200px',
                                height: '200px',
                                position: 'relative',
                                overflow: 'hidden',
                                backgroundColor: '#f0f0f0'
                            }}>

                                <img
                                    src={pending.localUrl}
                                    alt="Uploading..."
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--accent)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 500
                            }}>
                                Uploading...
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <div style={{
                position: 'fixed',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                gap: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '6px',
                boxShadow: '0 4px 12px var(--shadow-lg)',
                zIndex: 30
            }}>
                <button
                    onClick={handleZoomOut}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}
                    title="Zoom Out"
                >
                    −
                </button>
                <button
                    onClick={handleResetZoom}
                    style={{
                        minWidth: '48px',
                        height: '32px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)'
                    }}
                    title="Reset Zoom"
                >
                    {Math.round(zoom * 100)}%
                </button>
                <button
                    onClick={handleZoomIn}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}
                    title="Zoom In"
                >
                    +
                </button>
                <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 2px' }} />
                <button
                    onClick={handleFitToScreen}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}
                    title="Fit to Screen"
                >
                    ⊡
                </button>
            </div>

            <Toolbar onAddText={handleAddText} onUploadImage={handleUploadImage} />
        </div>
    );
}
