import os
from google import genai
from google.genai import types

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def get_embeddings(texts: list[str]) -> list[list[float]]:
    model = os.getenv("EMBED_MODEL", "gemini-embedding-001")
    result = _get_client().models.embed_content(
        model=model,
        contents=texts,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
    )
    return [e.values for e in result.embeddings]


def get_query_embedding(query: str) -> list[float]:
    model = os.getenv("EMBED_MODEL", "gemini-embedding-001")
    result = _get_client().models.embed_content(
        model=model,
        contents=[query],
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    return result.embeddings[0].values
