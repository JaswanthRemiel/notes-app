'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie, CreateMovie, MovieStatus } from '@/types';
import { getMovies, addMovie as addMovieFn, updateMovieStatus, updateMovieRating, deleteMovie } from '@/lib/database';
import { useAuth } from '@/context/AuthContext';

export function useMovies() {
    const { user } = useAuth();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMovies = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getMovies(user.$id);
            setMovies(data);
            setError(null);
        } catch (err) {
            setError('Failed to load movies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const addMovie = async (data: CreateMovie) => {
        if (!user) return;

        try {
            const newMovie = await addMovieFn(user.$id, data);
            setMovies(prev => [newMovie, ...prev]);
            return newMovie;
        } catch (err) {
            setError('Failed to add movie');
            console.error(err);
        }
    };

    const updateStatus = async (id: string, status: MovieStatus) => {
        try {
            const updated = await updateMovieStatus(id, status);
            setMovies(prev => prev.map(movie => movie.$id === id ? updated : movie));
            return updated;
        } catch (err) {
            setError('Failed to update movie status');
            console.error(err);
        }
    };

    const updateRating = async (id: string, rating: number) => {
        try {
            const updated = await updateMovieRating(id, rating);
            setMovies(prev => prev.map(movie => movie.$id === id ? updated : movie));
            return updated;
        } catch (err) {
            setError('Failed to update rating');
            console.error(err);
        }
    };

    const removeMovie = async (id: string) => {
        try {
            await deleteMovie(id);
            setMovies(prev => prev.filter(movie => movie.$id !== id));
        } catch (err) {
            setError('Failed to delete movie');
            console.error(err);
        }
    };

    const getMoviesByStatus = (status: MovieStatus) => {
        return movies.filter(movie => movie.status === status);
    };

    return {
        movies,
        loading,
        error,
        addMovie,
        updateStatus,
        updateRating,
        removeMovie,
        getMoviesByStatus,
        refresh: fetchMovies
    };
}
