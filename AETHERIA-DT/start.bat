@echo off
echo Starting Aetheria Multimodal RAG...

start cmd /k "cd backend && python main.py"
start cmd /k "cd frontend && npm run dev"

echo Services are starting. 
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
