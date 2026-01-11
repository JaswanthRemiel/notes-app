import { OMDbSearchResponse, OMDbMovieDetails } from '@/types';

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com';

export async function searchMovies(query: string): Promise<OMDbSearchResponse> {
    const response = await fetch(
        `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
    );
    return response.json();
}

export async function getMovieDetails(imdbId: string): Promise<OMDbMovieDetails> {
    const response = await fetch(
        `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}`
    );
    return response.json();
}
