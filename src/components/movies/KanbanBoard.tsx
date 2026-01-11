'use client';

import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useMovies } from '@/hooks/useMovies';
import { getMovieDetails } from '@/lib/omdb';
import { KanbanColumn } from './KanbanColumn';
import { AddMovieModal } from './AddMovieModal';
import { Button } from "@/components/ui/button";
import { MovieStatus, OMDbSearchResult } from '@/types';

const columns: { id: MovieStatus; title: string; emoji: string }[] = [
    { id: 'to_watch', title: 'Yet to Watch', emoji: '' },
    { id: 'watching', title: 'In Progress', emoji: '' },
    { id: 'watched', title: 'Watched', emoji: '' }
];

export function KanbanBoard() {
    const { movies, loading, addMovie, updateStatus, updateRating, removeMovie, getMoviesByStatus } = useMovies();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDragEnd = async (result: DropResult) => {
        const { destination, draggableId } = result;

        if (!destination) return;

        const newStatus = destination.droppableId as MovieStatus;
        const movie = movies.find(m => m.$id === draggableId);

        if (movie && movie.status !== newStatus) {
            await updateStatus(draggableId, newStatus);
        }
    };

    const handleAddMovie = async (searchResult: OMDbSearchResult) => {
        try {

            const details = await getMovieDetails(searchResult.imdbID);

            await addMovie({
                imdbId: searchResult.imdbID,
                title: details.Title,
                poster: details.Poster,
                imdbRating: details.imdbRating,
                status: 'to_watch'
            });
        } catch (error) {
            console.error('Failed to add movie:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="loading">Loading tentukotta...</div>
            </div>
        );
    }

    return (
        <div className="canvas-bg p-4 md:p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pt-5 relative z-10 shrink-0">
                <h1 className="m-0 text-2xl font-bold">
                    🎬 Movies
                </h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Add Movie
                </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 h-full snap-x snap-mandatory md:snap-none">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            emoji={column.emoji}
                            movies={getMoviesByStatus(column.id)}
                            onUpdateRating={updateRating}
                            onDelete={removeMovie}
                        />
                    ))}
                </div>
            </DragDropContext>

            <AddMovieModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddMovie={handleAddMovie}
            />
        </div>
    );
}
