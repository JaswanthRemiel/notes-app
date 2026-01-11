import { ID } from 'appwrite';
import { storage, STORAGE_BUCKET_ID } from './appwrite';

export async function uploadImage(file: File): Promise<string> {
    const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
    );

    // Get the file view URL
    const url = storage.getFileView(STORAGE_BUCKET_ID, response.$id);
    return url.toString();
}

export async function deleteImage(fileId: string): Promise<void> {
    await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
}

export function getFileIdFromUrl(url: string): string | null {
    // Extract file ID from Appwrite storage URL
    const match = url.match(/files\/([^/]+)\/view/);
    return match ? match[1] : null;
}
