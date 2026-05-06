# RAG - Retrieval Augmented Generation

Learning project to understand RAG (Retrieval Augmented Generation) by building a chat-with-your-files app.

## What it does

Upload a PDF and ask questions about it. The app retrieves relevant chunks from the document and uses them to generate answers.

## Stack

- **Client**: Next.js 16, Tailwind CSS, Clerk (auth)
- **Server**: Express, Multer (file uploads), BullMQ (job queue)
- **Queue**: Valkey (Redis-compatible)

## Setup

```bash
# Start Valkey
docker compose up -d

# Client
cd client
pnpm install
pnpm dev

# Server
cd server
pnpm install
pnpm run dev

# Worker
cd server
node --watch worker.js
```

## Environment Variables

Create `client/.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
```
