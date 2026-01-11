'use client';

import React, { useState, useMemo } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Movie, MovieStatus } from '@/types';
import { MovieCard } from './MovieCard';

interface KanbanColumnProps {
    id: MovieStatus;
    title: string;
    emoji: string;
    movies: Movie[];
    onUpdateRating: (id: string, rating: number) => void;
    onDelete: (id: string) => void;
}

type SortOption = 'default' | 'rating-high' | 'rating-low';

export function KanbanColumn({ id, title, emoji, movies, onUpdateRating, onDelete }: KanbanColumnProps) {
    const [sortBy, setSortBy] = useState<SortOption>('default');

    // Only show sorting for watched column
    const showSorting = id === 'watched';

    // Sort movies based on selection
    const sortedMovies = useMemo(() => {
        if (!showSorting || sortBy === 'default') return movies;

        return [...movies].sort((a, b) => {
            const ratingA = a.userRating ?? 0;
            const ratingB = b.userRating ?? 0;

            if (sortBy === 'rating-high') {
                return ratingB - ratingA; // Highest first
            } else {
                return ratingA - ratingB; // Lowest first
            }
        });
    }, [movies, sortBy, showSorting]);

    return (
        <div className="kanban-column" style={{ flex: 1, minWidth: '280px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <span style={{ fontSize: '20px' }}>{emoji}</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{title}</h3>
                <span style={{
                    marginLeft: 'auto',
                    background: 'var(--bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                }}>
                    {movies.length}
                </span>
            </div>

            {/* Sorting dropdown - only for watched column */}
            {showSorting && movies.length > 1 && (
                <div style={{ marginBottom: '12px' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="default">Sort by: Default</option>
                        <option value="rating-high">⭐ My Rating (High → Low)</option>
                        <option value="rating-low">⭐ My Rating (Low → High)</option>
                    </select>
                </div>
            )}

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                            minHeight: '300px',
                            padding: '4px',
                            borderRadius: '8px',
                            background: snapshot.isDraggingOver ? 'var(--bg-tertiary)' : 'transparent',
                            transition: 'background 0.2s'
                        }}
                    >
                        {sortedMovies.map((movie, index) => (
                            <Draggable key={movie.$id} draggableId={movie.$id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <MovieCard
                                            movie={movie}
                                            onUpdateRating={onUpdateRating}
                                            onDelete={onDelete}
                                            isDragging={snapshot.isDragging}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
