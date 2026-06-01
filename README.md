# Day 12 — PDF Chat App

A RAG-based app: upload a PDF, ask questions, get answers grounded in the document.

## Architecture

```
React (Vite) → FastAPI → ChromaDB (in-memory) + OpenAI
```

1. PDF upload → PyMuPDF extracts text → chunked (800 chars, 100 overlap) → embedded with `text-embedding-3-small` → stored in ChromaDB
2. Question → query embedding → top-4 semantic matches → GPT-4o-mini answers from context only

## Setup

### Prerequisites (one-time)
```bash
sudo apt install python3-venv python3-pip
```

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env from template
cp ../.env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Frontend
```bash
cd frontend
npm install   # already done
```

## Run

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
App: http://localhost:5173

## What you'll learn
- RAG (Retrieval-Augmented Generation) pipeline end-to-end
- Vector embeddings & semantic search with ChromaDB
- Chunking strategy: size vs overlap trade-offs
- FastAPI file upload handling
- React Context for state management
- Vite dev proxy (no CORS issues)

## Key files
| File | What it teaches |
|------|----------------|
| `backend/services/pdf_service.py` | PDF extraction + chunking |
| `backend/services/embedding_service.py` | Batched OpenAI embeddings |
| `backend/services/rag_service.py` | ChromaDB session management |
| `backend/routers/chat.py` | Full RAG pipeline in one place |
| `frontend/src/context/ChatContext.tsx` | React state machine pattern |
| `frontend/vite.config.ts` | Vite proxy setup |
