import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, MOODBOARD_COLLECTION_ID, MOVIES_COLLECTION_ID } from './appwrite';
import { MoodboardItem, CreateMoodboardItem, Movie, CreateMovie, MovieStatus } from '@/types';


export async function getMoodboardItems(userId: string): Promise<MoodboardItem[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        MOODBOARD_COLLECTION_ID,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
    );
    return response.documents as unknown as MoodboardItem[];
}

export async function createMoodboardItem(userId: string, data: CreateMoodboardItem): Promise<MoodboardItem> {
    const document = await databases.createDocument(
        DATABASE_ID,
        MOODBOARD_COLLECTION_ID,
        ID.unique(),
        {
            userId,
            ...data
        }
    );
    return document as unknown as MoodboardItem;
}

export async function updateMoodboardItem(id: string, data: Partial<MoodboardItem>): Promise<MoodboardItem> {
    const document = await databases.updateDocument(
        DATABASE_ID,
        MOODBOARD_COLLECTION_ID,
        id,
        data
    );
    return document as unknown as MoodboardItem;
}

export async function deleteMoodboardItem(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, MOODBOARD_COLLECTION_ID, id);
}


export async function getMovies(userId: string): Promise<Movie[]> {
    const response = await databases.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
    );
    return response.documents as unknown as Movie[];
}

export async function addMovie(userId: string, data: CreateMovie): Promise<Movie> {
    const document = await databases.createDocument(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
        ID.unique(),
        {
            userId,
            ...data,
            userRating: null
        }
    );
    return document as unknown as Movie;
}

export async function updateMovieStatus(id: string, status: MovieStatus): Promise<Movie> {
    const document = await databases.updateDocument(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
        id,
        { status }
    );
    return document as unknown as Movie;
}

export async function updateMovieRating(id: string, userRating: number): Promise<Movie> {
    const document = await databases.updateDocument(
        DATABASE_ID,
        MOVIES_COLLECTION_ID,
        id,
        { userRating }
    );
    return document as unknown as Movie;
}

export async function deleteMovie(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, MOVIES_COLLECTION_ID, id);
}
