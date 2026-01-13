'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useMoodboard } from '@/hooks/useMoodboard';
import { useMoodboards } from '@/hooks/useMoodboards';
import { uploadImage, uploadFile } from '@/lib/storage';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { CountdownBlock } from './CountdownBlock';
import { FileBlock } from './FileBlock';
import { MoodboardSwitcher } from './MoodboardSwitcher';
import { Toolbar } from './Toolbar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { MoodboardItem } from '@/types';
import { File02Icon } from 'hugeicons-react';

interface PendingImage {
    id: string;
    localUrl: string;
    positionX: number;
    positionY: number;
}

interface PendingFile {
    id: string;
    fileName: string;
    positionX: number;
    positionY: number;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;


export function Canvas() {
    const { moodboards, selectedMoodboard, selectedMoodboardId, selectMoodboard, addMoodboard, removeMoodboard, isDeleting, loading: boardsLoading } = useMoodboards();
    const { items, loading: itemsLoading, addItem, updateItem, removeItem } = useMoodboard(selectedMoodboardId);
    const loading = boardsLoading || itemsLoading;

    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [showFrameDialog, setShowFrameDialog] = useState(false);
    const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);


    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const panStartPoint = useRef({ x: 0, y: 0 });
    const isMouseDownForPan = useRef(false);
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
        const isDraggableBlock = target.closest('.draggable-block');

        // Prepare for potential pan on middle mouse, Alt+click, or left click on background
        if (e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && !isDraggableBlock)) {
            e.preventDefault();
            isMouseDownForPan.current = true;
            panStartPoint.current = { x: e.clientX, y: e.clientY };
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleCanvasTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const target = e.target as HTMLElement;
            const isDraggableBlock = target.closest('.draggable-block');

            // Pan on touch if not touching a block
            if (!isDraggableBlock) {
                e.preventDefault();
                setIsPanning(true);
                lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isMouseDownForPan.current) {
            const dx = e.clientX - panStartPoint.current.x;
            const dy = e.clientY - panStartPoint.current.y;

            // Start panning after moving 5px threshold
            if (!isPanning && Math.hypot(dx, dy) > 5) {
                setIsPanning(true);
            }

            if (isPanning) {
                const moveDx = e.clientX - lastPanPoint.current.x;
                const moveDy = e.clientY - lastPanPoint.current.y;
                setPan(prev => ({ x: prev.x + moveDx, y: prev.y + moveDy }));
                lastPanPoint.current = { x: e.clientX, y: e.clientY };
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isPanning && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - lastPanPoint.current.x;
            const dy = touch.clientY - lastPanPoint.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        isMouseDownForPan.current = false;
        panStartPoint.current = { x: 0, y: 0 };
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

    const handleAddCountdown = async () => {
        const centerX = Math.round((window.innerWidth / 2 - pan.x) / zoom - 100 + Math.random() * 200);
        const centerY = Math.round((window.innerHeight / 2 - pan.y) / zoom - 100 + Math.random() * 200);

        await addItem({
            type: 'countdown',
            content: '',
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

    const handleUploadImage = (file: File) => {
        setPendingUploadFile(file);
        setShowFrameDialog(true);
    };

    const confirmUpload = async (framed: boolean) => {
        if (!pendingUploadFile) return;

        const file = pendingUploadFile;
        setShowFrameDialog(false);
        setPendingUploadFile(null);
        setIsUploading(true);

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
                positionY: centerY,
                style: JSON.stringify({ framed })
            });
        } catch (error) {
            console.error('Failed to upload image:', error);
        } finally {
            setPendingImages(prev => prev.filter(p => p.id !== pendingId));
            URL.revokeObjectURL(localUrl);
            setIsUploading(false);
        }
    };

    const handleUpdate = async (id: string, data: Partial<MoodboardItem>) => {
        await updateItem(id, data);
    };

    const handleDelete = async (id: string) => {
        await removeItem(id);
    };

    const handleUploadFile = async (file: File) => {
        const centerX = Math.round((window.innerWidth / 2 - pan.x) / zoom - 100 + Math.random() * 200);
        const centerY = Math.round((window.innerHeight / 2 - pan.y) / zoom - 100 + Math.random() * 200);

        const pendingId = `pending-file-${Date.now()}`;

        setPendingFiles(prev => [...prev, {
            id: pendingId,
            fileName: file.name,
            positionX: centerX,
            positionY: centerY
        }]);

        try {
            const { url, fileName } = await uploadFile(file);
            await addItem({
                type: 'file',
                content: url,
                positionX: centerX,
                positionY: centerY,
                style: JSON.stringify({ fileName })
            });
        } catch (error) {
            console.error('Failed to upload file:', error);
        } finally {
            setPendingFiles(prev => prev.filter(p => p.id !== pendingId));
        }
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
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onPaste={handlePaste}
        >
            {/* Moodboard Switcher - top left */}
            <MoodboardSwitcher
                moodboards={moodboards}
                selectedMoodboard={selectedMoodboard}
                onSelect={selectMoodboard}
                onAdd={addMoodboard}
                onDelete={removeMoodboard}
                isDeleting={isDeleting}
            />

            <div
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    position: 'absolute',
                    width: '5000px',
                    height: '5000px'
                }}
            >

                {items.map((item, index) => (
                    item.type === 'text' ? (
                        <TextBlock
                            key={item.$id}
                            item={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            zoom={zoom}
                            pan={pan}
                            zIndex={index + 1}
                        />
                    ) : item.type === 'countdown' ? (
                        <CountdownBlock
                            key={item.$id}
                            item={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            zoom={zoom}
                            pan={pan}
                            zIndex={index + 1}
                        />
                    ) : item.type === 'file' ? (
                        <FileBlock
                            key={item.$id}
                            item={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            zoom={zoom}
                            pan={pan}
                            zIndex={index + 1}
                        />
                    ) : (
                        <ImageBlock
                            key={item.$id}
                            item={item}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            zoom={zoom}
                            pan={pan}
                            zIndex={index + 1}
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

                {pendingFiles.map((pending) => (
                    <div
                        key={pending.id}
                        className="draggable-block"
                        style={{
                            position: 'absolute',
                            left: pending.positionX,
                            top: pending.positionY,
                        }}
                    >
                        <div
                            className="p-4 rounded-lg flex items-center gap-3 opacity-70"
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 4px 12px var(--shadow)',
                                minWidth: '160px'
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
                                >
                                    {pending.fileName.length > 15
                                        ? pending.fileName.substring(0, 12) + '...'
                                        : pending.fileName}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    Uploading...
                                </div>
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

            <Toolbar onAddText={handleAddText} onUploadImage={handleUploadImage} onAddCountdown={handleAddCountdown} onUploadFile={handleUploadFile} />

            <Modal
                isOpen={showFrameDialog}
                onClose={() => {
                    setShowFrameDialog(false);
                    setPendingUploadFile(null);
                }}
                title="Add Frame?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Do you want to add a frame to this image (Polaroid style) or keep it as is?
                    </p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => confirmUpload(false)}
                        >
                            No Frame (Transparent)
                        </Button>
                        <Button
                            onClick={() => confirmUpload(true)}
                        >
                            Add Frame
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
