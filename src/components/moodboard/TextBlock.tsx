'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoodboardItem } from '@/types';
import {
    TextBoldIcon,
    TextItalicIcon,
    TextUnderlineIcon,
    TextStrikethroughIcon,
    Link02Icon,
    LeftToRightListNumberIcon,
    LeftToRightListBulletIcon,
    Task01Icon,
    TextAlignLeftIcon,
    TextAlignCenterIcon,
    TextAlignRightIcon,
    Heading01Icon,
    Heading02Icon,
    Heading03Icon,
    ParagraphIcon
} from 'hugeicons-react';
import { cn } from '@/lib/utils'; // Assuming generic cn utility exists

interface TextBlockProps {
    item: MoodboardItem;
    onUpdate: (id: string, data: Partial<MoodboardItem>) => void;
    onDelete: (id: string) => void;
    zoom: number;
    pan: { x: number; y: number };
}

const COLORS = [
    { name: 'Default', value: 'var(--text-primary)' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
];

export function TextBlock({ item, onUpdate, onDelete, zoom, pan }: TextBlockProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const blockRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const isMouseDown = useRef(false);

    // Sync content when not editing
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

        // Apply drag threshold
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
        // Convert screen coordinates to canvas coordinates accounting for zoom and pan
        const newX = (e.clientX - canvasRect.left - pan.x) / zoom - dragOffset.current.x / zoom;
        const newY = (e.clientY - canvasRect.top - pan.y) / zoom - dragOffset.current.y / zoom;

        if (blockRef.current) {
            blockRef.current.style.left = `${newX}px`;
            blockRef.current.style.top = `${newY}px`;
        }
    };

    const handleMouseUp = () => {
        if (!isMouseDown.current) return; // Was not a drag initiated here

        isMouseDown.current = false;

        if (isDragging) {
            setIsDragging(false);
            if (blockRef.current) {
                const left = parseInt(blockRef.current.style.left);
                const top = parseInt(blockRef.current.style.top);
                onUpdate(item.$id, { positionX: left, positionY: top });
            }
        } else {
            // Click logic - Enable Edit Mode
            if (!isEditing && blockRef.current && contentRef.current) {
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
    }, [isDragging]);

    const handleContentClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Checkbox toggling logic
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            const checkbox = target as HTMLInputElement;
            // Toggle attribute for persistence
            if (checkbox.checked) {
                checkbox.setAttribute('checked', 'true');
            } else {
                checkbox.removeAttribute('checked');
            }

            // Find the parent div of the checkbox to strike through
            const parent = checkbox.closest('div');
            const textContent = parent?.querySelector('div');

            if (textContent && textContent !== contentRef.current) {
                if (checkbox.checked) {
                    (textContent as HTMLElement).style.textDecoration = 'line-through';
                    (textContent as HTMLElement).style.color = 'var(--text-muted)';
                    (textContent as HTMLElement).style.opacity = '0.7';
                } else {
                    (textContent as HTMLElement).style.textDecoration = 'none';
                    (textContent as HTMLElement).style.color = 'var(--text-primary)';
                    (textContent as HTMLElement).style.opacity = '1';
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
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const anchorNode = selection.anchorNode;
        // Find if we are inside a checklist item wrapper
        let checkItemWrapper = anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement;
        while (checkItemWrapper && checkItemWrapper !== contentRef.current && !checkItemWrapper.querySelector('input[type="checkbox"]')) {
            // If we hit the editor root, stop
            if (checkItemWrapper.parentElement === contentRef.current) break;
            checkItemWrapper = checkItemWrapper.parentElement;
        }

        // Ensure strictly identifying the flex wrapper we created
        const isChecklist = checkItemWrapper instanceof HTMLElement &&
            checkItemWrapper.style.display === 'flex' &&
            !!checkItemWrapper.querySelector('input[type="checkbox"]');

        if (e.key === 'Enter') {
            if (isChecklist && checkItemWrapper instanceof HTMLElement) {
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
                textDiv.innerHTML = '<br>'; // Empty line that can hold cursor

                newContainer.appendChild(checkbox);
                newContainer.appendChild(textDiv);

                // Insert AFTER the current checklist item
                if (checkItemWrapper.nextSibling) {
                    checkItemWrapper.parentNode?.insertBefore(newContainer, checkItemWrapper.nextSibling);
                } else {
                    checkItemWrapper.parentNode?.appendChild(newContainer);
                }

                // Move cursor to new item
                const range = document.createRange();
                range.selectNodeContents(textDiv);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }
        }

        if (e.key === 'Backspace') {
            if (isChecklist && checkItemWrapper instanceof HTMLElement) {
                // Check if cursor is at the start of the text div
                const range = selection.getRangeAt(0);
                // Find the text container sibling of the checkbox
                const textDiv = checkItemWrapper.querySelector('div');

                // Only act if we are inside that text div (or it itself)
                if (textDiv && (anchorNode === textDiv || textDiv.contains(anchorNode))) {
                    if (range.startOffset === 0 && selection.isCollapsed) {
                        e.preventDefault();

                        // Case 1: Empty item -> Remove entirely
                        if (textDiv.innerText.trim() === '' && textDiv.innerHTML !== '<br>') { // Check for empty or just br
                            const prevSibling = checkItemWrapper.previousElementSibling;
                            checkItemWrapper.remove();

                            if (prevSibling instanceof HTMLElement) {
                                // Focus previous item end
                                // If previous is also checklist, focus its textdiv
                                const prevTextDiv = prevSibling.querySelector('div');
                                const target = prevTextDiv || prevSibling;

                                const newRange = document.createRange();
                                newRange.selectNodeContents(target);
                                newRange.collapse(false);
                                selection.removeAllRanges();
                                selection.addRange(newRange);
                            }
                        } else {
                            // Case 2: Not empty -> Convert to normal text (unwrap)
                            const content = textDiv.innerHTML;
                            const p = document.createElement('div');
                            p.innerHTML = content;

                            checkItemWrapper.parentNode?.insertBefore(p, checkItemWrapper);
                            checkItemWrapper.remove();

                            const newRange = document.createRange();
                            newRange.selectNodeContents(p);
                            newRange.collapse(true); // Start of line
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        }
                    }
                }
            }
        }
    };

    const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget?.innerHTML || '';

        // Timeout to check if focus moved to toolbar
        setTimeout(() => {
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

    // --- Formatting Logic ---

    const execCommand = (command: string, value?: string) => {
        contentRef.current?.focus();
        setTimeout(() => {
            document.execCommand(command, false, value);
        }, 0);
    };

    const formatBlock = (tag: string) => execCommand('formatBlock', tag);
    const formatLink = () => {
        const url = prompt('Enter URL:', 'https://');
        if (url) execCommand('createLink', url);
    };

    // Checkbox logic (simplified for brevity, similar to before)
    const formatChecklist = () => {
        const checkboxHtml = '<div style="display: flex; align-items: flex-start; margin: 4px 0;"><input type="checkbox" style="margin-right: 8px; margin-top: 4px; cursor: pointer;"> <div>&nbsp;</div></div>';
        execCommand('insertHTML', checkboxHtml);
    };

    // --- Render Helpers ---

    const ToolbarButton = ({ onClick, icon: Icon, title, active }: any) => (
        <button
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={onClick}
            title={title}
            className={cn(
                "p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                active && "bg-muted text-foreground"
            )}
        >
            <Icon size={16} />
        </button>
    );

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
                "draggable-block text-block absolute min-w-[200px]",
                isDragging && "opacity-80 cursor-grabbing",
                !isDragging && "cursor-text"
            )}
            style={{
                left: item.positionX,
                top: item.positionY,
                zIndex: isDragging ? 1000 : (isEditing ? 100 : 10),
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Delete Button */}
            {isHovered && !isDragging && deleteButton}

            {/* Floating Toolbar */}
            {showToolbar && (
                <div
                    className="text-toolbar absolute bottom-full left-0 mb-2 bg-background/95 backdrop-blur shadow-xl border border-border rounded-lg p-1 flex flex-col gap-1 min-w-max z-[100]"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {/* Top Row: Formatting */}
                    <div className="flex items-center gap-0.5 border-b border-border/50 pb-1">
                        <ToolbarButton onClick={() => formatBlock('P')} icon={ParagraphIcon} title="Normal Text" />
                        <ToolbarButton onClick={() => formatBlock('H1')} icon={Heading01Icon} title="Heading 1" />
                        <ToolbarButton onClick={() => formatBlock('H2')} icon={Heading02Icon} title="Heading 2" />

                        <div className="w-px h-4 bg-border mx-1" />

                        <ToolbarButton onClick={() => execCommand('bold')} icon={TextBoldIcon} title="Bold" />
                        <ToolbarButton onClick={() => execCommand('italic')} icon={TextItalicIcon} title="Italic" />
                        <ToolbarButton onClick={() => execCommand('underline')} icon={TextUnderlineIcon} title="Underline" />
                        <ToolbarButton onClick={() => execCommand('strikeThrough')} icon={TextStrikethroughIcon} title="Strikethrough" />

                        <div className="w-px h-4 bg-border mx-1" />

                        <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={TextAlignLeftIcon} title="Align Left" />
                        <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={TextAlignCenterIcon} title="Align Center" />
                        <ToolbarButton onClick={() => execCommand('justifyRight')} icon={TextAlignRightIcon} title="Align Right" />
                    </div>

                    {/* Bottom Row: Lists & Colors */}
                    <div className="flex items-center gap-0.5 pt-1 justify-between">
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={LeftToRightListBulletIcon} title="Bullet List" />
                            <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={LeftToRightListNumberIcon} title="Numbered List" />
                            <ToolbarButton onClick={formatChecklist} icon={Task01Icon} title="Checklist" />
                            <ToolbarButton onClick={formatLink} icon={Link02Icon} title="Link" />
                        </div>

                        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/50">
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', color.value); }}
                                    className="w-4 h-4 rounded-full border border-border/50 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Editable Content */}
            <style>{globalStyles}</style>
            <div
                ref={contentRef}
                className="text-block-content outline-none p-2 rounded-lg empty:before:content-['Type_something...'] empty:before:text-muted-foreground transition-all duration-200"
                contentEditable
                suppressContentEditableWarning
                onFocus={handleFocus}
                onBlur={handleContentBlur}
                onClick={handleContentClick}
                onKeyDown={handleKeyDown}
                style={{
                    minHeight: '24px',
                    cursor: 'text',
                    backgroundColor: isEditing ? 'rgba(var(--bg-rgb), 0.5)' : 'transparent'
                }}
            />
        </div>
    );
}

// Global style for specific text block behaviors (checklist items etc)
// We might want to move this to generic CSS if it grows
const globalStyles = `
    .text-block-content ul { list-style-type: disc; padding-left: 20px; }
    .text-block-content ol { list-style-type: decimal; padding-left: 20px; }
    .text-block-content a { color: var(--accent); text-decoration: underline; }
`;
