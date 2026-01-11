import { MoodboardItem, Movie } from '@/types';

// Demo user
export const DEMO_USER = {
    $id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com'
};

// Demo moodboard items
export const DEMO_MOODBOARD_ITEMS: MoodboardItem[] = [
    {
        $id: 'text-1',
        userId: 'demo-user-123',
        type: 'text',
        content: '✨ Welcome to your moodboard! Drag me around and edit my text.',
        positionX: 100,
        positionY: 120,
        createdAt: new Date().toISOString()
    },
    {
        $id: 'text-2',
        userId: 'demo-user-123',
        type: 'text',
        content: '💡 Ideas for 2026:\n• Learn a new skill\n• Travel somewhere new\n• Start a side project',
        positionX: 400,
        positionY: 80,
        createdAt: new Date().toISOString()
    },
    {
        $id: 'text-3',
        userId: 'demo-user-123',
        type: 'text',
        content: '🎯 Goals:\n- Build amazing apps\n- Stay creative\n- Have fun!',
        positionX: 150,
        positionY: 350,
        createdAt: new Date().toISOString()
    },
    {
        $id: 'image-1',
        userId: 'demo-user-123',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        positionX: 650,
        positionY: 150,
        createdAt: new Date().toISOString()
    },
    {
        $id: 'image-2',
        userId: 'demo-user-123',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop',
        positionX: 450,
        positionY: 320,
        createdAt: new Date().toISOString()
    }
];

// Demo movies
export const DEMO_MOVIES: Movie[] = [
    {
        $id: 'movie-1',
        userId: 'demo-user-123',
        imdbId: 'tt1375666',
        title: 'Inception',
        poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
        imdbRating: '8.8',
        userRating: null,
        status: 'to_watch',
        createdAt: new Date().toISOString()
    },
    {
        $id: 'movie-2',
        userId: 'demo-user-123',
        imdbId: 'tt0816692',
        title: 'Interstellar',
        poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg',
        imdbRating: '8.7',
        userRating: null,
        status: 'to_watch',
        createdAt: new Date().toISOString()
    },
    {
        $id: 'movie-3',
        userId: 'demo-user-123',
        imdbId: 'tt0468569',
        title: 'The Dark Knight',
        poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
        imdbRating: '9.0',
        userRating: null,
        status: 'watching',
        createdAt: new Date().toISOString()
    },
    {
        $id: 'movie-4',
        userId: 'demo-user-123',
        imdbId: 'tt0111161',
        title: 'The Shawshank Redemption',
        poster: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_SX300.jpg',
        imdbRating: '9.3',
        userRating: 10,
        status: 'watched',
        createdAt: new Date().toISOString()
    },
    {
        $id: 'movie-5',
        userId: 'demo-user-123',
        imdbId: 'tt0133093',
        title: 'The Matrix',
        poster: 'https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_SX300.jpg',
        imdbRating: '8.7',
        userRating: 9,
        status: 'watched',
        createdAt: new Date().toISOString()
    },
    {
        $id: 'movie-6',
        userId: 'demo-user-123',
        imdbId: 'tt0109830',
        title: 'Forrest Gump',
        poster: 'https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_SX300.jpg',
        imdbRating: '8.8',
        userRating: 8,
        status: 'watched',
        createdAt: new Date().toISOString()
    }
];

// Check if we're in demo mode (no Appwrite configured)
export const isDemoMode = () => {
    return !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
        process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID === 'your_project_id';
};
