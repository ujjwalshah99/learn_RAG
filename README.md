# RAG - Chat with your PDF

Upload a PDF and ask questions about it. The app retrieves relevant chunks from the document and uses an LLM to generate answers with full conversation history.

## Architecture

```
Client (Next.js) → Server (Express) → Gemini 2.5 Flash (LLM)
                        ↓                    ↑
                   BullMQ Queue         Qdrant (vector search)
                        ↓                    ↑
                   Worker (PDF processing → embeddings → Qdrant)
```

1. **Upload**: PDF is uploaded via Express/Multer and pushed to a BullMQ job queue
2. **Processing**: Worker loads the PDF, splits it into chunks, generates embeddings (Gemini), and stores them in Qdrant
3. **Chat**: User question → similarity search in Qdrant → relevant chunks + chat history sent to Gemini → answer returned

## Stack

- **Client**: Next.js, Tailwind CSS, Clerk (auth)
- **Server**: Express, Multer (file uploads), BullMQ (job queue), Google Gemini 2.5 Flash (LLM)
- **Worker**: LangChain (PDF loader, text splitter), Google Gemini Embeddings
- **Vector DB**: Qdrant (cloud or local)
- **Queue**: Valkey (Redis-compatible)

## Setup

### Prerequisites

- Node.js 18+
- Docker (for Valkey)
- Qdrant instance (cloud or local)
- Google AI API key (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### Start services

```bash
# Start Valkey
docker compose up -d
```

### Server

```bash
cd server
pnpm install
pnpm run dev          # starts Express on port 8000
pnpm run dev-worker   # starts BullMQ worker
```

### Client

```bash
cd client
pnpm install
pnpm dev              # starts Next.js on port 3000
```

## Environment Variables

Create `server/.env`:

```
GOOGLE_API_KEY=your_google_ai_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
```

Create `client/.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key
```

## API Endpoints

| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| POST   | `/upload/pdf`  | Upload a PDF (multipart) |
| POST   | `/chat`        | Send a message (`{ message, history }`) |
