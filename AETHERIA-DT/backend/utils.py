import os
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_community.vectorstores import Chroma
from PIL import Image
import base64
import io
import requests

# Configuration
EMBED_MODEL = "nomic-embed-text"
VISION_MODEL = "llava"
OLLAMA_BASE_URL = "http://localhost:11434"

embeddings = OllamaEmbeddings(model=EMBED_MODEL, base_url=OLLAMA_BASE_URL)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

def process_pdf(file_path: str):
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    chunks = text_splitter.split_documents(pages)
    return chunks

def describe_image(image_path: str):
    """Uses Llava model via Ollama to describe an image."""
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
    
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={
            "model": VISION_MODEL,
            "prompt": "Describe this image in detail for a searchable database. Mention shapes, text, objects, and colors.",
            "images": [encoded_string],
            "stream": False
        }
    )
    if response.status_code == 200:
        return response.json().get("response", "")
    return ""

def build_vector_store(chunks: List, persist_directory: str = "db"):
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_directory
    )
    return vector_db

def get_vector_store(persist_directory: str = "db"):
    return Chroma(persist_directory=persist_directory, embedding_function=embeddings)
