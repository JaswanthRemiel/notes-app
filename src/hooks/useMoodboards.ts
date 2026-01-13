'use client';

import { useState, useEffect, useCallback } from 'react';
import { Moodboard, CreateMoodboard } from '@/types';
import { getMoodboards, createMoodboard, deleteMoodboard, updateMoodboard, getMoodboardItems, deleteMoodboardItem } from '@/lib/database';
import { deleteImage, getFileIdFromUrl } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';

const SELECTED_MOODBOARD_KEY = 'selectedMoodboardId';

export function useMoodboards() {
    const { user } = useAuth();
    const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
    const [selectedMoodboardId, setSelectedMoodboardId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMoodboards = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getMoodboards(user.$id);
            setMoodboards(data);

            // Auto-create default moodboard if none exist
            if (data.length === 0) {
                const defaultBoard = await createMoodboard(user.$id, { name: 'My Moodboard' });
                setMoodboards([defaultBoard]);
                setSelectedMoodboardId(defaultBoard.$id);
                localStorage.setItem(SELECTED_MOODBOARD_KEY, defaultBoard.$id);
            } else {
                // Restore selected moodboard from localStorage or use first one
                const savedId = localStorage.getItem(SELECTED_MOODBOARD_KEY);
                if (savedId && data.some(m => m.$id === savedId)) {
                    setSelectedMoodboardId(savedId);
                } else {
                    setSelectedMoodboardId(data[0].$id);
                    localStorage.setItem(SELECTED_MOODBOARD_KEY, data[0].$id);
                }
            }

            setError(null);
        } catch (err) {
            setError('Failed to load moodboards');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMoodboards();
    }, [fetchMoodboards]);

    const selectMoodboard = (id: string) => {
        setSelectedMoodboardId(id);
        localStorage.setItem(SELECTED_MOODBOARD_KEY, id);
    };

    const addMoodboard = async (name: string) => {
        if (!user) return;

        try {
            const newBoard = await createMoodboard(user.$id, { name });
            setMoodboards(prev => [...prev, newBoard]);
            selectMoodboard(newBoard.$id);
            return newBoard;
        } catch (err) {
            setError('Failed to create moodboard');
            console.error(err);
        }
    };

    const removeMoodboard = async (id: string) => {
        if (!user) return;
        if (moodboards.length <= 1) {
            setError('Cannot delete the last moodboard');
            return;
        }

        try {
            setIsDeleting(true);

            // Step 1: Get all items in this moodboard
            const items = await getMoodboardItems(user.$id, id);

            // Step 2: Delete each item (and its storage file if applicable)
            for (const item of items) {
                // Delete from storage if it's an image or file
                if ((item.type === 'image' || item.type === 'file') && item.content) {
                    const fileId = getFileIdFromUrl(item.content);
                    if (fileId) {
                        try {
                            await deleteImage(fileId);
                        } catch (storageErr) {
                            console.warn('Failed to delete file from storage:', storageErr);
                        }
                    }
                }
                // Delete the item from database
                await deleteMoodboardItem(item.$id);
            }

            // Step 3: Delete the moodboard itself
            await deleteMoodboard(id);
            setMoodboards(prev => prev.filter(m => m.$id !== id));

            // If we deleted the selected moodboard, select another one
            if (selectedMoodboardId === id) {
                const remaining = moodboards.filter(m => m.$id !== id);
                if (remaining.length > 0) {
                    selectMoodboard(remaining[0].$id);
                }
            }
        } catch (err) {
            setError('Failed to delete moodboard');
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    const renameMoodboard = async (id: string, name: string) => {
        try {
            const updated = await updateMoodboard(id, { name });
            setMoodboards(prev => prev.map(m => m.$id === id ? updated : m));
            return updated;
        } catch (err) {
            setError('Failed to rename moodboard');
            console.error(err);
        }
    };

    const selectedMoodboard = moodboards.find(m => m.$id === selectedMoodboardId) || null;

    return {
        moodboards,
        selectedMoodboard,
        selectedMoodboardId,
        loading,
        isDeleting,
        error,
        selectMoodboard,
        addMoodboard,
        removeMoodboard,
        renameMoodboard,
        refresh: fetchMoodboards
    };
}

