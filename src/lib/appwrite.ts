import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const MOODBOARD_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MOODBOARD_COLLECTION_ID || '';
export const MOVIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MOVIES_COLLECTION_ID || '';
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '';

export { client };
