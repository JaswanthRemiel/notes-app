'use client';

import { useState, useEffect, useCallback } from 'react';
import { MoodboardItem, CreateMoodboardItem } from '@/types';
import { getMoodboardItems, createMoodboardItem, updateMoodboardItem, deleteMoodboardItem } from '@/lib/database';
import { deleteImage, getFileIdFromUrl } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';

export function useMoodboard() {
    const { user } = useAuth();
    const [items, setItems] = useState<MoodboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getMoodboardItems(user.$id);
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load moodboard items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (data: CreateMoodboardItem) => {
        if (!user) return;

        try {
            const newItem = await createMoodboardItem(user.$id, data);
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
        // Find the item first to check if it's an image
        const itemToDelete = items.find(item => item.$id === id);

        try {
            // If it's an image, delete from storage first
            if (itemToDelete?.type === 'image' && itemToDelete.content) {
                const fileId = getFileIdFromUrl(itemToDelete.content);
                if (fileId) {
                    try {
                        await deleteImage(fileId);
                    } catch (storageErr) {
                        console.warn('Failed to delete image from storage:', storageErr);
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
