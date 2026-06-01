import fitz  # pymupdf


def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = [page.get_text() for page in doc]
    doc.close()
    return "\n\n".join(pages)


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 <= chunk_size:
            current = (current + "\n\n" + para).strip()
        else:
            if current:
                chunks.append(current)
            # Start new chunk with overlap from tail of previous chunk
            tail = current[-overlap:] if len(current) > overlap else current
            current = (tail + "\n\n" + para).strip()

    if current.strip():
        chunks.append(current.strip())

    return chunks
