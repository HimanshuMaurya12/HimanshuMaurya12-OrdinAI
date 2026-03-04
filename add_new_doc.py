import os
import json
import uuid
import re
import requests
import mimetypes
import urllib3
from typing import List, Optional
from urllib.parse import urlparse, urljoin, parse_qs
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from bs4 import BeautifulSoup

# Use the universal partition instead of partition_pdf
from unstructured.partition.auto import partition 

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

# Set your Google Drive paths
RAW_DIR = os.path.expanduser("~/Library/CloudStorage/GoogleDrive-himanshumauryaa12@gmail.com/My Drive/OrdinAI_Raw_Data")
CLEANED_DIR = os.path.expanduser("~/Library/CloudStorage/GoogleDrive-himanshumauryaa12@gmail.com/My Drive/OrdinAI_Cleaned_JSONs")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(CLEANED_DIR, exist_ok=True)

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) OrdinAI/1.0"
}


def _determine_extension(content_type: str, url: str) -> str:
    content_type = content_type.split(";")[0].lower().strip()
    if "application/pdf" in content_type:
        return ".pdf"
    if "text/html" in content_type:
        return ".html"
    ext = os.path.splitext(urlparse(url).path)[1].lower()
    if ext:
        return ext
    return mimetypes.guess_extension(content_type) or ".txt"


def _download_to_raw_dir(url: str) -> tuple[str, str]:
    try:
        response = requests.get(url, stream=True, timeout=60, verify=False, headers=REQUEST_HEADERS)
        response.raise_for_status()
    except Exception as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    content_type = response.headers.get("Content-Type", "")
    filename = os.path.basename(urlparse(url).path)
    ext = _determine_extension(content_type, url)

    if not filename:
        filename = f"document_{uuid.uuid4().hex[:8]}{ext}"
    elif not filename.lower().endswith(ext):
        filename = f"{filename}{ext}"

    raw_path = os.path.join(RAW_DIR, filename)
    print(f"⬇️ Downloading as {ext.upper()} to {raw_path}...")

    with open(raw_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)

    return raw_path, filename


def _extract_with_unstructured(path: str) -> str:
    print(f"⚙️ Extracting text with Unstructured...")
    try:
        elements = partition(filename=path, strategy="fast")
    except Exception:
        elements = partition(filename=path)
    return "\n\n".join([str(el).strip() for el in elements if str(el).strip()]).strip()


def _extract_visible_html_text(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines).strip()


def _find_embedded_document_urls(html_path: str, page_url: str) -> List[str]:
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")

    candidates: List[str] = []

    def add_url(raw_url: Optional[str]) -> None:
        if not raw_url:
            return
        resolved = urljoin(page_url, raw_url.strip())
        if not resolved:
            return
        candidates.append(resolved)
        parsed = urlparse(resolved)
        params = parse_qs(parsed.query)
        for key in ("file", "url", "doc", "document"):
            for linked in params.get(key, []):
                if linked:
                    candidates.append(urljoin(page_url, linked))

    for tag, attr in (("iframe", "src"), ("embed", "src"), ("object", "data"), ("a", "href")):
        for element in soup.find_all(tag):
            add_url(element.get(attr))

    filtered: List[str] = []
    seen = set()
    for candidate in candidates:
        lc = candidate.lower()
        is_document = lc.endswith(".pdf") or ".pdf?" in lc or "/attachdocs/" in lc
        if is_document and candidate not in seen:
            seen.add(candidate)
            filtered.append(candidate)
    return filtered


def ingest_new_document(url: str) -> None:
    print(f"🚀 Starting End-to-End Ingestion for: {url}")

    # 1. Download the requested URL
    raw_path, filename = _download_to_raw_dir(url)
    ext = os.path.splitext(filename)[1].lower()

    # 2. Extract text from downloaded file
    full_text = _extract_with_unstructured(raw_path)

    # If HTML is a shell page (common on regulator websites), follow embedded document links.
    if ext == ".html":
        html_text = _extract_visible_html_text(raw_path)
        if not full_text and html_text:
            full_text = html_text

        embedded_urls = _find_embedded_document_urls(raw_path, url)
        if embedded_urls and len(full_text) < 1200:
            print("🔎 HTML appears to embed a document. Trying embedded links...")
            for embedded_url in embedded_urls:
                try:
                    embedded_path, embedded_filename = _download_to_raw_dir(embedded_url)
                    embedded_text = _extract_with_unstructured(embedded_path)
                    embedded_ext = os.path.splitext(embedded_filename)[1].lower()
                    if embedded_text and (embedded_ext == ".pdf" or len(embedded_text) >= 1200):
                        full_text = embedded_text
                        filename = embedded_filename
                        print(f"✅ Extracted from embedded file: {embedded_filename}")
                        break
                except Exception as e:
                    print(f"⚠️ Skipping embedded URL due to error: {e}")

        if len(full_text) < 50 and html_text:
            full_text = html_text

    if not full_text:
        raise ValueError(f"No extractable text found in {filename}")
    
    # Save Backup JSON
    # Replace the actual extension with .json for the backup
    json_filename = os.path.splitext(filename)[0] + '.json'
    json_path = os.path.join(CLEANED_DIR, json_filename)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump([{"text": full_text}], f, ensure_ascii=False)
        
    # 3. Chunking
    print("✂️ Chunking Parent and Child nodes...")
    parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
    child_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    
    parent_chunks = parent_splitter.split_text(full_text)
    
    # 4. Embed & Upload
    print("🧠 Embedding on M2 Chip and Uploading to Qdrant...")
    embedder = SentenceTransformer('BAAI/bge-large-en-v1.5', device='cpu')
    qdrant = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
    
    vectors: List[List[float]] = []
    payloads: List[dict] = []
    ids: List[str] = []
    
    try:
        for p_id, p_text in enumerate(parent_chunks):
            child_chunks = child_splitter.split_text(p_text)
            for c_id, c_text in enumerate(child_chunks):
                vector = embedder.encode(c_text).tolist()
                payload = {
                    "source_file": filename,
                    "child_text": c_text,
                    "parent_text": p_text,
                    "chunk_id": f"{filename}_p{p_id}_c{c_id}",
                }
                vectors.append(vector)
                payloads.append(payload)
                ids.append(str(uuid.uuid4()))

        if vectors:
            qdrant.upsert(
                collection_name="ordinai_finance",
                points=models.Batch(ids=ids, vectors=vectors, payloads=payloads),
            )
        else:
            raise ValueError(f"No chunks produced from extracted text in {filename}")
    finally:
        qdrant.close()
    print(f"✅ SUCCESS! {filename} is now searchable in OrdinAI.")

if __name__ == "__main__":
    # Testing with the HTML link provided
    test_url = "https://www.sebi.gov.in/legal/master-circulars/jan-2026/master-circular-for-framework-on-social-stock-exchange-_99166.html"
    ingest_new_document(test_url)
