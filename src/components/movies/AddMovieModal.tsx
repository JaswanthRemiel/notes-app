'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { searchMovies } from '@/lib/omdb';
import { OMDbSearchResult } from '@/types';
import Image from 'next/image';

interface AddMovieModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMovie: (movie: OMDbSearchResult) => void;
}

export function AddMovieModal({ isOpen, onClose, onAddMovie }: AddMovieModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<OMDbSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await searchMovies(query);
            if (response.Response === 'True') {
                setResults(response.Search);
            } else {
                setError(response.Error || 'No movies found');
                setResults([]);
            }
        } catch (err) {
            setError('Failed to search movies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (movie: OMDbSearchResult) => {
        onAddMovie(movie);
        setQuery('');
        setResults([]);
        onClose();
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Movie">
            <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <Input
                        placeholder="Search for a movie..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ flex: 1, marginBottom: 0 }}
                    />
                    <Button type="submit" isLoading={loading}>
                        Search
                    </Button>
                </div>
            </form>

            {error && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    {error}
                </p>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {results.map((movie) => (
                    <div
                        key={movie.imdbID}
                        onClick={() => handleSelect(movie)}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            marginBottom: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{
                            width: '50px',
                            height: '75px',
                            position: 'relative',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            background: 'var(--bg-tertiary)',
                            flexShrink: 0
                        }}>
                            {movie.Poster !== 'N/A' && (
                                <Image
                                    src={movie.Poster}
                                    alt={movie.Title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            )}
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                                {movie.Title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                {movie.Year} • {movie.Type}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
}
