import os
import uuid

from fastapi import APIRouter, HTTPException, UploadFile, File
from groq import Groq

from models.schemas import ChatRequest, ChatResponse, DeleteResponse, UploadResponse
from services.embedding_service import get_embeddings, get_query_embedding
from services.pdf_service import chunk_text, extract_text_from_pdf
from services.rag_service import (
    create_session_collection,
    delete_session_collection,
    query_collection,
)

router = APIRouter()

SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions based ONLY on the provided "
    "PDF document context. If the answer is not found in the context, say "
    "'I couldn't find that information in the PDF.' "
    "Do not use knowledge outside of the provided context."
)

_groq: Groq | None = None


def _groq_client() -> Groq:
    global _groq
    if _groq is None:
        _groq = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _groq


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    text = extract_text_from_pdf(file_bytes)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    chunk_size = int(os.getenv("CHUNK_SIZE", 800))
    chunk_overlap = int(os.getenv("CHUNK_OVERLAP", 100))
    chunks = chunk_text(text, chunk_size=chunk_size, overlap=chunk_overlap)

    embeddings = get_embeddings(chunks)

    session_id = str(uuid.uuid4())
    chunk_count = create_session_collection(session_id, chunks, embeddings)

    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        chunk_count=chunk_count,
        message=f"PDF indexed successfully into {chunk_count} chunks.",
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        query_embedding = get_query_embedding(req.question)
        top_k = int(os.getenv("TOP_K_RESULTS", 4))
        chunks = query_collection(req.session_id, query_embedding, top_k=top_k)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Session not found: {e}")

    context = "\n\n---\n\n".join(chunks)
    chat_model = os.getenv("CHAT_MODEL", "llama-3.1-8b-instant")

    completion = _groq_client().chat.completions.create(
        model=chat_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Context from PDF:\n\n{context}\n\nQuestion: {req.question}",
            },
        ],
        temperature=0.2,
    )
    answer = completion.choices[0].message.content or ""

    return ChatResponse(answer=answer, sources=chunks)


@router.delete("/session/{session_id}", response_model=DeleteResponse)
async def delete_session(session_id: str):
    delete_session_collection(session_id)
    return DeleteResponse(message=f"Session {session_id} deleted.")
