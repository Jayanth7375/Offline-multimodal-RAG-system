from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
import shutil
import requests
import json
import asyncio
from utils import process_pdf, describe_image, build_vector_store, get_vector_store
from langchain_core.documents import Document

app = FastAPI(title="Aetheria RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)

OLLAMA_BASE_URL = "http://localhost:11434"

@app.get("/stats")
async def get_stats():
    try:
        docs_count = len([f for f in os.listdir(UPLOAD_DIR) if os.path.isfile(os.path.join(UPLOAD_DIR, f))])
        return {"total_documents": docs_count, "model": "Llama 3"}
    except: return {"total_documents": 0, "model": "Llama 3"}

@app.post("/reset")
async def reset_vault():
    if os.path.exists(UPLOAD_DIR):
        for f in os.listdir(UPLOAD_DIR):
            try: os.remove(os.path.join(UPLOAD_DIR, f))
            except: pass
    if os.path.exists("db"):
        try: shutil.rmtree("db")
        except: pass
    return {"status": "cleared"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    chunks = []
    if file.filename.endswith(".pdf"): chunks = process_pdf(file_path)
    elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        description = describe_image(file_path)
        chunks = [Document(page_content=description, metadata={"source": file.filename})]
    else:
        with open(file_path, "r", encoding="utf-8") as f: chunks = [Document(page_content=f.read(), metadata={"source": file.filename})]
    if chunks: build_vector_store(chunks)
    return {"status": "processed"}

@app.post("/chat")
async def chat(
    message: str = Form(...),
    history: str = Form("[]"),
    model: str = Form("llama3:latest"),
    system_prompt: str = Form("You are Aetheria. Rule: For diagrams, ALWAYS use Mermaid blocks: ```mermaid [code] ```. Use [Node] only."),
    temperature: float = Form(0.7),
    top_p: float = Form(0.9)
):
    async def generate():
        try:
            # Parse history
            chat_history = json.loads(history)
            
            # Context Retrieval
            vector_db = get_vector_store()
            docs = vector_db.similarity_search(message, k=3)
            context = "\n".join([doc.page_content for doc in docs])
            
            # Build Prompt with History & Context
            full_prompt = f"<|start_header_id|>system<|end_header_id|>\n\n{system_prompt}\nContext: {context}<|eot_id|>"
            
            for turn in chat_history[-6:]: # Keep last 6 turns for context
                role = turn.get("role", "user")
                content = turn.get("content", "")
                full_prompt += f"<|start_header_id|>{role}<|end_header_id|>\n\n{content}<|eot_id|>"
            
            full_prompt += f"<|start_header_id|>user<|end_header_id|>\n\n{message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"

            payload = {
                "model": model,
                "prompt": full_prompt,
                "stream": True,
                "options": {
                    "temperature": temperature,
                    "top_p": top_p
                }
            }

            with requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, stream=True, timeout=120) as r:
                for line in r.iter_lines():
                    if line:
                        chunk = json.loads(line)
                        if "response" in chunk: yield chunk["response"]
                        if chunk.get("done"): break
        except Exception as e:
            yield f"\n\nSystem Notice: {str(e)}"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    # RESTART MANUALLY: uvicorn main:app --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
