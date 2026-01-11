'use client';

import React, { useState } from 'react';
import { Movie } from '@/types';
import Image from 'next/image';

interface MovieCardProps {
    movie: Movie;
    onUpdateRating: (id: string, rating: number) => void;
    onDelete: (id: string) => void;
    isDragging?: boolean;
}

export function MovieCard({ movie, onUpdateRating, onDelete, isDragging }: MovieCardProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 10; i++) {
            const isFilled = i <= (hoverRating || movie.userRating || 0);
            stars.push(
                <span
                    key={i}
                    className={`star ${isFilled ? 'filled' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onUpdateRating(movie.$id, i);
                    }}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ fontSize: '14px' }}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div
            className="movie-card"
            style={{
                opacity: isDragging ? 0.5 : 1,
                transform: isDragging ? 'rotate(3deg)' : 'none'
            }}
        >
            <div style={{ display: 'flex', gap: '12px' }}>
                {/* Poster */}
                <div style={{
                    width: '60px',
                    height: '90px',
                    position: 'relative',
                    borderRadius: '0',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0
                }}>
                    {movie.poster !== 'N/A' && (
                        <Image
                            src={movie.poster}
                            alt={movie.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized
                        />
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{
                            margin: '0 0 4px 0',
                            fontSize: '14px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '120px'
                        }}>
                            {movie.title}
                        </h4>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(movie.$id); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: 0,
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* IMDb Rating */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '8px'
                    }}>
                        <span style={{ color: '#fbbf24', fontSize: '12px' }}>⭐</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {movie.imdbRating || 'N/A'}
                        </span>
                    </div>

                    {/* User Rating - only show for watched movies */}
                    {movie.status === 'watched' && (
                        <div>
                            <p style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                marginBottom: '4px',
                                margin: 0
                            }}>
                                Your rating:
                            </p>
                            <div className="star-rating">
                                {renderStars()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
