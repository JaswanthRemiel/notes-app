import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID } from './appwrite';
import { User } from '@/types';

const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';


function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

export async function signup(username: string, password: string): Promise<User> {

    const existing = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('username', username)]
    );

    if (existing.documents.length > 0) {
        throw new Error('Username already exists');
    }


    const user = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
            username,
            passwordHash: simpleHash(password)
        }
    );


    const userData: User = {
        $id: user.$id,
        name: username,
        email: username
    };
    localStorage.setItem('notes_user', JSON.stringify(userData));

    return userData;
}

export async function login(username: string, password: string): Promise<User> {
    const result = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('username', username)]
    );

    if (result.documents.length === 0) {
        throw new Error('User not found');
    }

    const user = result.documents[0];

    if (user.passwordHash !== simpleHash(password)) {
        throw new Error('Invalid password');
    }


    const userData: User = {
        $id: user.$id,
        name: username,
        email: username
    };
    localStorage.setItem('notes_user', JSON.stringify(userData));

    return userData;
}

export async function logout(): Promise<void> {
    localStorage.removeItem('notes_user');
}

export async function getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem('notes_user');
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}
