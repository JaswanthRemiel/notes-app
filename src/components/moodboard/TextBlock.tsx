'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    const dragStart = useRef({ x: 0, y: 0 });
    const isMouseDown = useRef(false);

    // Sync content when not editing to avoid overwriting user changes or cursor position
    useEffect(() => {
        if (!isEditing && contentRef.current && item.content !== contentRef.current.innerHTML) {
            contentRef.current.innerHTML = item.content || '';
        }
    }, [item.content, isEditing]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;

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

        // Apply drag threshold of 5px
        if (!isDragging) {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            if (Math.hypot(dx, dy) > 5) {
                setIsDragging(true);
            } else {
                return; // Haven't moved enough to start dragging
            }
        }

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
            // If we didn't drag, this is a click - ensure we focus the editor
            // Check if we didn't just click the delete button (which effectively unmounts us)
            if (!isEditing && blockRef.current && contentRef.current) {
                // Determine if we should focus. If the browser already focused it (clicked text),
                // activeElement will match. If clicked padding, it won't.
                if (document.activeElement !== contentRef.current) {
                    contentRef.current.focus();

                    // Move caret to end
                    const range = document.createRange();
                    const selection = window.getSelection();
                    range.selectNodeContents(contentRef.current);
                    range.collapse(false);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }
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
    }, [isDragging]); // Relying on refs for most state, but isDragging triggers render for class update

    const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget?.innerHTML || '';

        // Small timeout to allow click events on toolbar to fire before hiding it
        setTimeout(() => {
            // Check if focus moved to a toolbar button
            if (document.activeElement?.closest('.text-toolbar')) {
                return;
            }

            setIsEditing(false);
            setShowToolbar(false);
            if (newContent !== item.content) {
                onUpdate(item.$id, { content: newContent });
            }
        }, 100);
    };

    const handleFocus = () => {
        if (!isDragging) {
            setIsEditing(true);
            setShowToolbar(true);
        }
    };


    const handleContentClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Checkbox toggling logic
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            const checkbox = target as HTMLInputElement;

            if (checkbox.checked) {
                checkbox.setAttribute('checked', 'true');
            } else {
                checkbox.removeAttribute('checked');
            }

            // Find the parent div of the checkbox to strike through
            const parent = checkbox.closest('div');

            if (parent && parent !== contentRef.current) {
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const anchorNode = selection.anchorNode;

            // Check if we are inside a checklist item (div with checkbox)
            // or if the immediately preceding element is a checkbox
            let isChecklist = false;
            let parentBlock = anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement;

            // Traverse up to find a block element inside the editor
            while (parentBlock && parentBlock !== contentRef.current && parentBlock.parentElement !== contentRef.current) {
                parentBlock = parentBlock.parentElement;
            }

            if (parentBlock instanceof HTMLElement) {
                if (parentBlock.querySelector('input[type="checkbox"]')) {
                    isChecklist = true;
                }
            }

            if (isChecklist && parentBlock instanceof HTMLElement) {
                e.preventDefault();

                // Create the new elements manually
                const newContainer = document.createElement('div');
                newContainer.style.display = 'flex';
                newContainer.style.alignItems = 'flex-start';
                newContainer.style.margin = '4px 0';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.marginRight = '8px';
                checkbox.style.marginTop = '4px';
                checkbox.style.cursor = 'pointer';

                const textDiv = document.createElement('div');
                textDiv.innerHTML = '<br>';

                newContainer.appendChild(checkbox);
                newContainer.appendChild(textDiv);

                // Insert AFTER the current checklist item
                if (parentBlock.nextSibling) {
                    parentBlock.parentNode?.insertBefore(newContainer, parentBlock.nextSibling);
                } else {
                    parentBlock.parentNode?.appendChild(newContainer);
                }

                // Move cursor
                const range = document.createRange();
                range.selectNodeContents(textDiv);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                return;
            }
        }
    };


    const execCommand = (command: string, value?: string) => {
        contentRef.current?.focus();
        // Use timeout to ensure focus is applied
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
        // Wrap in a div to allow proper line-through styling of just this item
        const checkboxHtml = '<div style="display: flex; align-items: flex-start; margin: 4px 0;"><input type="checkbox" style="margin-right: 8px; margin-top: 4px; cursor: pointer;"> <div>&nbsp;</div></div>';
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
                zIndex: isDragging ? 1000 : undefined
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && !isDragging && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(item.$id); }}
                    onMouseDown={(e) => e.stopPropagation()}
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
                    className="text-toolbar"
                    style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '8px',
                        padding: '6px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        flexWrap: 'wrap'
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevent losing focus from editor
                >
                    <button onClick={formatBold} style={toolbarButtonStyle} title="Bold (Ctrl+B)"><strong>B</strong></button>
                    <button onClick={formatItalic} style={toolbarButtonStyle} title="Italic (Ctrl+I)"><em>I</em></button>
                    <button onClick={formatUnderline} style={toolbarButtonStyle} title="Underline (Ctrl+U)"><u>U</u></button>
                    <button onClick={formatStrike} style={toolbarButtonStyle} title="Strikethrough"><s>S</s></button>
                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                    <button onClick={formatLink} style={toolbarButtonStyle} title="Link / Unlink">🔗</button>
                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                    <button onClick={() => formatList('unordered')} style={toolbarButtonStyle} title="Bullet List">•</button>
                    <button onClick={() => formatList('ordered')} style={toolbarButtonStyle} title="Numbered List">1.</button>
                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />
                    <button onClick={formatChecklist} style={toolbarButtonStyle} title="Insert Checkbox">☑️</button>
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
                onKeyDown={handleKeyDown}
                style={{ minHeight: '24px', cursor: 'text' }}
            />
        </div>
    );
}
