'use client';

import { useState, useEffect, useCallback } from 'react';
import { MoodboardItem, CreateMoodboardItem } from '@/types';
import { getMoodboardItems, createMoodboardItem, updateMoodboardItem, deleteMoodboardItem } from '@/lib/database';
import { deleteImage, getFileIdFromUrl } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';

export function useMoodboard(moodboardId: string | null) {
    const { user } = useAuth();
    const [items, setItems] = useState<MoodboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!user || !moodboardId) {
            setItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getMoodboardItems(user.$id, moodboardId);
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load moodboard items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user, moodboardId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (data: Omit<CreateMoodboardItem, 'moodboardId'>) => {
        if (!user || !moodboardId) return;

        try {
            const newItem = await createMoodboardItem(user.$id, { ...data, moodboardId });
            setItems(prev => [...prev, newItem]);
            return newItem;
        } catch (err) {
            setError('Failed to add item');
            console.error(err);
        }
    };

    const updateItem = async (id: string, data: Partial<MoodboardItem>) => {
        try {
            const updated = await updateMoodboardItem(id, data);
            setItems(prev => {
                const others = prev.filter(item => item.$id !== id);
                return [...others, updated];
            });
            return updated;
        } catch (err) {
            setError('Failed to update item');
            console.error(err);
        }
    };

    const removeItem = async (id: string) => {
        // Find the item first to check if it's an image or file
        const itemToDelete = items.find(item => item.$id === id);

        try {
            // If it's an image or file, delete from storage first
            if ((itemToDelete?.type === 'image' || itemToDelete?.type === 'file') && itemToDelete.content) {
                const fileId = getFileIdFromUrl(itemToDelete.content);
                if (fileId) {
                    try {
                        await deleteImage(fileId);
                    } catch (storageErr) {
                        console.warn('Failed to delete file from storage:', storageErr);
                        // Continue to delete the database record even if storage deletion fails
                    }
                }
            }

            // Delete from database
            await deleteMoodboardItem(id);
            setItems(prev => prev.filter(item => item.$id !== id));
        } catch (err) {
            setError('Failed to delete item');
            console.error(err);
        }
    };

    return {
        items,
        loading,
        error,
        addItem,
        updateItem,
        removeItem,
        refresh: fetchItems
    };
}

