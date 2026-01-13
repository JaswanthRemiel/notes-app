// Moodboard Types
export interface Moodboard {
  $id: string;
  userId: string;
  name: string;
}

export interface CreateMoodboard {
  name: string;
}

export interface MoodboardItem {
  $id: string;
  userId: string;
  moodboardId: string;
  type: 'text' | 'image' | 'countdown' | 'file';
  content: string;
  positionX: number;
  positionY: number;
  style?: string;
  createdAt: string;
}

export interface CreateMoodboardItem {
  moodboardId: string;
  type: 'text' | 'image' | 'countdown' | 'file';
  content: string;
  positionX: number;
  positionY: number;
  style?: string;
}

// Movie Types
export type MovieStatus = 'to_watch' | 'watching' | 'watched';

export interface Movie {
  $id: string;
  userId: string;
  imdbId: string;
  title: string;
  poster: string;
  imdbRating: string;
  userRating: number | null;
  status: MovieStatus;
  createdAt: string;
}

export interface CreateMovie {
  imdbId: string;
  title: string;
  poster: string;
  imdbRating: string;
  status: MovieStatus;
}

// OMDb API Types
export interface OMDbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OMDbSearchResponse {
  Search: OMDbSearchResult[];
  totalResults: string;
  Response: string;
  Error?: string;
}

export interface OMDbMovieDetails {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  imdbRating: string;
  Plot: string;
  Director: string;
  Actors: string;
  Genre: string;
}

// Auth Types
export interface User {
  $id: string;
  name: string;
  email: string;
}
