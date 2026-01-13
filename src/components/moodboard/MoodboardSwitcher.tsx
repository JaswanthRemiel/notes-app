'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Moodboard } from '@/types';
import { Add01Icon, Delete02Icon, ArrowDown01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MoodboardSwitcherProps {
    moodboards: Moodboard[];
    selectedMoodboard: Moodboard | null;
    onSelect: (id: string) => void;
    onAdd: (name: string) => void;
    onDelete: (id: string) => Promise<void>;
    isDeleting?: boolean;
}

export function MoodboardSwitcher({
    moodboards,
    selectedMoodboard,
    onSelect,
    onAdd,
    onDelete,
    isDeleting = false
}: MoodboardSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [boardToDelete, setBoardToDelete] = useState<Moodboard | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreate = () => {
        if (newName.trim()) {
            onAdd(newName.trim());
            setNewName('');
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreate();
        } else if (e.key === 'Escape') {
            setIsCreating(false);
            setNewName('');
        }
    };

    const handleSelectBoard = (id: string) => {
        onSelect(id);
        setIsOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (boardToDelete) {
            await onDelete(boardToDelete.$id);
            setBoardToDelete(null);
        }
    };

    return (
        <>
            {/* Delete Confirmation Modal */}
            {boardToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setBoardToDelete(null)}
                >
                    <div
                        className="rounded-xl p-6 max-w-sm w-full mx-4"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 8px 32px var(--shadow-lg)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Delete Moodboard?
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Are you sure you want to delete "<strong>{boardToDelete.name}</strong>"?
                            All items will be permanently deleted.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setBoardToDelete(null)} disabled={isDeleting}>
                                No, Keep It
                            </Button>
                            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Modal */}
            {isCreating && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={() => { setIsCreating(false); setNewName(''); }}
                >
                    <div
                        className="rounded-xl p-6 max-w-sm w-full mx-4"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 8px 32px var(--shadow-lg)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            New Moodboard
                        </h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter board name..."
                            autoFocus
                            className="w-full px-4 py-3 text-sm rounded-lg outline-none mb-4"
                            style={{
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => { setIsCreating(false); setNewName(''); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={!newName.trim()}>
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Switcher */}
            <div ref={dropdownRef} className="fixed top-4 left-4 z-40">
                <div
                    className="rounded-xl transition-all duration-200 flex items-center"
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 20px var(--shadow-lg)'
                    }}
                >
                    {/* Clickable area - Avatar + Name + Arrow */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 p-1 pr-3 rounded-xl transition-colors hover:bg-[var(--bg-tertiary)]"
                    >
                        {/* Avatar */}
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                                color: 'white',
                                textTransform: 'uppercase'
                            }}
                        >
                            {selectedMoodboard?.name?.charAt(0) || '?'}
                        </div>

                        {/* Name + Arrow */}
                        <span className="text-sm font-medium truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>
                            {selectedMoodboard?.name || 'Select'}
                        </span>
                        <ArrowDown01Icon
                            size={14}
                            className={cn("transition-transform", isOpen && "rotate-180")}
                            style={{ color: 'var(--text-muted)' }}
                        />
                    </button>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 pr-2 border-l pl-2" style={{ borderColor: 'var(--border-color)' }}>
                        {moodboards.length > 1 && (
                            <button
                                onClick={() => selectedMoodboard && setBoardToDelete(selectedMoodboard)}
                                className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                                title="Delete this board"
                            >
                                <Delete02Icon size={14} style={{ color: 'var(--error)' }} />
                            </button>
                        )}
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                            title="New board"
                        >
                            <Add01Icon size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    </div>
                </div>

                {/* Dropdown list */}
                {isOpen && (
                    <div
                        className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden min-w-[180px]"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 8px 24px var(--shadow-lg)'
                        }}
                    >
                        {moodboards.map((board) => (
                            <button
                                key={board.$id}
                                onClick={() => handleSelectBoard(board.$id)}
                                className={cn(
                                    "w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2",
                                    board.$id === selectedMoodboard?.$id
                                        ? "bg-[var(--bg-tertiary)]"
                                        : "hover:bg-[var(--bg-tertiary)]"
                                )}
                                style={{
                                    color: board.$id === selectedMoodboard?.$id
                                        ? 'var(--text-primary)'
                                        : 'var(--text-secondary)'
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                                        color: 'white',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {board.name.charAt(0)}
                                </div>
                                <span className="truncate">{board.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}




