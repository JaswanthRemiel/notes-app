'use client';

import React, { useState, useRef } from 'react';
import { MoodboardItem } from '@/types';

interface TextBlockProps {
    item: MoodboardItem;
    onUpdate: (id: string, data: Partial<MoodboardItem>) => void;
    onDelete: (id: string) => void;
}

export function TextBlock({ item, onUpdate, onDelete }: TextBlockProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const blockRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;

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

    const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {

        const newContent = e.currentTarget?.innerHTML || '';


        setTimeout(() => {
            if (!contentRef.current?.contains(document.activeElement)) {
                setIsEditing(false);
                setShowToolbar(false);
                if (newContent !== item.content) {
                    onUpdate(item.$id, { content: newContent });
                }
            }
        }, 100);
    };

    const handleFocus = () => {
        setIsEditing(true);
        setShowToolbar(true);
    };


    const handleContentClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;


        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            const checkbox = target as HTMLInputElement;


            if (checkbox.checked) {
                checkbox.setAttribute('checked', 'true');
            } else {
                checkbox.removeAttribute('checked');
            }

            // Find the closest parent (likely a div or p) or the next text node wrapper


            const parent = checkbox.parentElement;
            if (parent) {
                if (checkbox.checked) {
                    parent.style.textDecoration = 'line-through';
                    parent.style.color = 'var(--text-muted)';
                    parent.style.opacity = '0.7';
                } else {
                    parent.style.textDecoration = 'none';
                    parent.style.color = 'var(--text-primary)';
                    parent.style.opacity = '1';
                }
            }


            if (contentRef.current) {
                onUpdate(item.$id, { content: contentRef.current.innerHTML });
            }
            return;
        }

        if (!isEditing) {
            if (target.tagName === 'A') {
                e.preventDefault();
                const href = target.getAttribute('href');
                if (href) {
                    window.open(href, '_blank', 'noopener,noreferrer');
                }
            }
        }
    };


    const execCommand = (command: string, value?: string) => {

        contentRef.current?.focus();


        setTimeout(() => {
            document.execCommand(command, false, value);
        }, 0);
    };

    const formatList = (type: 'ordered' | 'unordered') => {
        contentRef.current?.focus();
        setTimeout(() => {
            if (type === 'ordered') {
                document.execCommand('insertOrderedList', false);
            } else {
                document.execCommand('insertUnorderedList', false);
            }
        }, 0);
    };

    const formatBold = () => execCommand('bold');
    const formatItalic = () => execCommand('italic');
    const formatUnderline = () => execCommand('underline');
    const formatStrike = () => execCommand('strikeThrough');

    const formatCode = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            if (selectedText) {
                const code = document.createElement('code');
                code.style.background = 'var(--bg-tertiary)';
                code.style.padding = '2px 6px';
                code.style.borderRadius = '4px';
                code.style.fontFamily = 'monospace';
                code.style.fontSize = '13px';
                code.textContent = selectedText;
                range.deleteContents();
                range.insertNode(code);
            }
        }
    };

    const formatLink = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;


        const anchorNode = selection.anchorNode;
        const linkElement = anchorNode?.parentElement?.closest('a');

        if (linkElement) {

            const range = document.createRange();
            range.selectNode(linkElement);
            selection.removeAllRanges();
            selection.addRange(range);
            execCommand('unlink');
        } else {

            const selectedText = selection.toString();
            const urlPattern = /^(https?:\/\/|www\.)/i;
            let url = '';

            if (urlPattern.test(selectedText)) {
                url = selectedText.startsWith('http') ? selectedText : `https://${selectedText}`;
            } else {
                url = prompt('Enter URL:', 'https://') || '';
            }

            if (url) {
                execCommand('createLink', url);

                setTimeout(() => {
                    const links = contentRef.current?.querySelectorAll('a');
                    links?.forEach(link => {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                        link.style.color = 'var(--accent)';
                        link.style.textDecoration = 'underline';
                    });
                }, 10);
            }
        }
    };

    const formatChecklist = () => {


        const checkboxHtml = '<input type="checkbox" style="margin-right: 8px; vertical-align: middle; cursor: pointer;">';
        execCommand('insertHTML', checkboxHtml);
    };

    const toolbarButtonStyle: React.CSSProperties = {
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        color: 'var(--text-primary)',
        transition: 'all 0.15s ease'
    };

    return (
        <div
            ref={blockRef}
            className={`draggable-block text-block ${isDragging ? 'dragging' : ''}`}
            style={{
                left: item.positionX,
                top: item.positionY,
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >

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
                        fontSize: '14px',
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


            {showToolbar && (
                <div
                    style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '8px',
                        padding: '6px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        flexWrap: 'wrap'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <button
                        onClick={formatBold}
                        style={toolbarButtonStyle}
                        title="Bold (Ctrl+B)"
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        onClick={formatItalic}
                        style={toolbarButtonStyle}
                        title="Italic (Ctrl+I)"
                    >
                        <em>I</em>
                    </button>
                    <button
                        onClick={formatUnderline}
                        style={toolbarButtonStyle}
                        title="Underline (Ctrl+U)"
                    >
                        <u>U</u>
                    </button>
                    <button
                        onClick={formatStrike}
                        style={toolbarButtonStyle}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </button>

                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                    <button
                        onClick={formatLink}
                        style={toolbarButtonStyle}
                        title="Link / Unlink"
                    >
                        🔗
                    </button>
                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                    <button
                        onClick={() => formatList('unordered')}
                        style={toolbarButtonStyle}
                        title="Bullet List"
                    >
                        •
                    </button>
                    <button
                        onClick={() => formatList('ordered')}
                        style={toolbarButtonStyle}
                        title="Numbered List"
                    >
                        1.
                    </button>
                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                    <button
                        onClick={formatChecklist}
                        style={toolbarButtonStyle}
                        title="Insert Checkbox"
                    >
                        ☑️
                    </button>
                </div>
            )}


            <div
                ref={contentRef}
                className="text-block-content"
                contentEditable
                suppressContentEditableWarning
                onFocus={handleFocus}
                onBlur={handleContentBlur}
                onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: item.content || '' }}
                style={{ minHeight: '60px' }}
            />
        </div>
    );
}
