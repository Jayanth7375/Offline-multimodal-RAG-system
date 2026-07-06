# Walkthrough: Aetheria Multimodal RAG

Welcome to **Aetheria**, your private AI sanctuary. This walkthrough explains how the system works and how you can leverage its multimodal capabilities.

## 🌈 The Experience
When you launch Aetheria, you are greeted by a sleek, cyberpunk-inspired interface. The glassmorphic side panel allows you to feed your AI local documents.

## 🧠 How it Works

### 1. Document Ingestion
When you upload a file:
- **PDFs**: The system splits text into semantic chunks to preserve context.
- **Images**: Using a Vision-Language Model (Llava), Aetheria "looks" at your image, describes it in detail (shapes, text within images, objects), and stores this description in the vector database.
- **Embeddings**: All data is converted into high-dimensional vectors using `nomic-embed-text`, stored locally in **ChromaDB**.

### 2. Intelligent Retrieval
When you ask a question:
1. Your query is converted into a vector.
2. Aetheria performs a semantic search across your indexed PDFs and Image descriptions.
3. The most relevant "context" is retrieved.

### 3. Local Inference
The retrieved context and your question are sent to **Llama 3** (running locally via Ollama). It generates an answer based *only* on your provided information, ensuring accuracy and avoiding hallucinations.

## 🛠️ Key Files
- [main.py](file:///c:/Users/Hp/Downloads/Design%20Thinking/backend/main.py): The heart of the API.
- [utils.py](file:///c:/Users/Hp/Downloads/Design%20Thinking/backend/utils.py): The "brain" logic for processing data.
- [page.tsx](file:///c:/Users/Hp/Downloads/Design%20Thinking/frontend/src/app/page.tsx): The premium UI component.

---

## 🚀 Pro Tips
- **Complex Diagrams**: Upload screenshots of architecture diagrams or charts. Aetheria can describe them and answer questions about the flow.
- **Privacy**: Since this runs on **Ollama**, you can use it for sensitive company documents without fear of data leaks.
