import chromadb
from chromadb.config import Settings

_chroma = chromadb.Client(Settings(anonymized_telemetry=False))


def create_session_collection(
    session_id: str,
    chunks: list[str],
    embeddings: list[list[float]],
) -> int:
    collection = _chroma.create_collection(
        name=f"session_{session_id}",
        metadata={"hnsw:space": "cosine"},
    )
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))],
    )
    return len(chunks)


def query_collection(
    session_id: str,
    query_embedding: list[float],
    top_k: int = 4,
) -> list[str]:
    collection = _chroma.get_collection(name=f"session_{session_id}")
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents"],
    )
    return results["documents"][0]


def delete_session_collection(session_id: str) -> None:
    try:
        _chroma.delete_collection(name=f"session_{session_id}")
    except Exception:
        pass
