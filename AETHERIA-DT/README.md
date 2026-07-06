# Aetheria: Offline Multimodal RAG System

Aetheria is a premium, private, and powerful RAG system that runs entirely on your local machine. It uses Llama 3 for reasoning and Llava for visual understanding, ensuring your data never leaves your hardware.

## ✨ Features
- **Privacy First**: 100% offline execution via Ollama.
- **Multimodal**: Chat with PDFs, Images (diagrams, photos), and Text files.
- **Premium UI**: Glassmorphic design with real-time feedback.
- **Fast Retrieval**: Powered by ChromaDB and Nomic Embeddings.

## 🚀 Prerequisites
1. **Ollama**: [Download & Install Ollama](https://ollama.com/)
2. **Models**: Run the following commands:
   ```bash
   ollama pull llama3
   ollama pull llava
   ollama pull nomic-embed-text
   ```

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Tech Stack
- **Frontend**: Next.js 14, Vanilla CSS (Glassmorphism)
- **Backend**: FastAPI, LangChain
- **AI Models**: Ollama (Llama 3, Llava)
- **Vector DB**: ChromaDB
