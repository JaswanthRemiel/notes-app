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
        <div className="kanban-column flex-1 min-w-[280px] sm:min-w-[320px] snap-center h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <span className="text-xl">{emoji}</span>
                <h3 className="m-0 text-base font-semibold">{title}</h3>
                <span className="ml-auto bg-muted px-2 py-0.5 rounded-xl text-xs text-muted-foreground">
                    {movies.length}
                </span>
            </div>

            {/* Sorting dropdown - only for watched column */}
            {showSorting && movies.length > 1 && (
                <div className="mb-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-full p-2 rounded-lg border border-border bg-muted text-foreground text-[13px] cursor-pointer outline-none focus:ring-2 focus:ring-ring/20"
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
                        className={`min-h-[100px] flex-1 overflow-y-auto p-1 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-transparent'
                            }`}
                    >
                        {sortedMovies.map((movie, index) => (
                            <Draggable key={movie.$id} draggableId={movie.$id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="mb-3 last:mb-0"
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
