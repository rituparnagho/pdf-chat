from pydantic import BaseModel


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    chunk_count: int
    message: str


class ChatRequest(BaseModel):
    session_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


class DeleteResponse(BaseModel):
    message: str
