# Notes - Personal Moodboard & Movies Tracker

A beautiful, full-stack web application built with **Next.js 14** (App Router) and **Appwrite** for authentication, database, and file storage.

## Features

### 🎨 Moodboard
- Canvas-based freeform layout with dotted background
- **Text Blocks**: Editable inline, draggable, position saved to database
- **Image Blocks**: Upload images displayed in polaroid-style frames with tape decoration
- Dark/Light mode toggle
- Each user sees only their own moodboard

### 🎬 Movies Tracker
- Kanban board with 3 columns: Yet to Watch, In Progress, Watched
- Search movies via OMDb API (IMDb data)
- Display movie poster and IMDb rating
- Drag and drop between columns
- Personal rating (1-10 stars) for watched movies

### 🔐 Authentication
- Username/Email + Password signup and login
- Protected routes with automatic redirect
- Session management via Appwrite

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Backend**: Appwrite (Auth, Database, Storage)
- **Drag & Drop**: @hello-pangea/dnd
- **Movie Data**: OMDb API

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Appwrite

1. Create an Appwrite project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a database
3. Create two collections:

**Moodboard Collection**:
| Attribute | Type | Size |
|-----------|------|------|
| userId | String | 36 |
| type | Enum | text, image |
| content | String | 5000 |
| positionX | Integer | - |
| positionY | Integer | - |
| createdAt | DateTime | - |

**Movies Collection**:
| Attribute | Type | Size |
|-----------|------|------|
| userId | String | 36 |
| imdbId | String | 20 |
| title | String | 200 |
| poster | String | 500 |
| imdbRating | String | 10 |
| userRating | Integer | - |
| status | Enum | to_watch, watching, watched |
| createdAt | DateTime | - |

4. Create a storage bucket named "images"
5. Set permissions for collections and bucket:
   - Users: Create, Read, Update, Delete (their own documents)

### 3. Get OMDb API Key

1. Go to [omdbapi.com](http://www.omdbapi.com/apikey.aspx)
2. Sign up for a free API key (1000 requests/day)

### 4. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_MOODBOARD_COLLECTION_ID=your_moodboard_collection_id
NEXT_PUBLIC_APPWRITE_MOVIES_COLLECTION_ID=your_movies_collection_id
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your_storage_bucket_id
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Set custom domain to `notes.remiel.work`

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Public auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/      # Protected app pages
│   │   ├── layout.tsx    # Auth check + navigation
│   │   ├── moodboard/
│   │   └── movies/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── moodboard/
│   ├── movies/
│   └── ui/
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useMoodboard.ts
│   └── useMovies.ts
├── lib/
│   ├── appwrite.ts
│   ├── auth.ts
│   ├── database.ts
│   ├── omdb.ts
│   └── storage.ts
└── types/
    └── index.ts
```

## License

MIT
