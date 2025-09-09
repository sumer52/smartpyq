#!/usr/bin/env python3
"""
Simple FastAPI server to demonstrate Gemini chatbot integration.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Smart PYQ Chatbot API",
    description="AI-powered chatbot for academic assistance",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: str = "You are a helpful AI assistant for students. Help them with academic questions, study tips, and previous year question papers."

class ChatResponse(BaseModel):
    response: str
    model_used: str
    success: bool

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Smart PYQ Chatbot API",
        "status": "running",
        "gemini_configured": model is not None
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "gemini_api": "configured" if model else "not configured"
    }

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the AI assistant."""
    
    # If no valid model, provide a mock response for testing
    if not model or api_key == "your_gemini_api_key":
        mock_responses = {
            "what is python": "Python is a high-level, interpreted programming language known for its simplicity and readability. It's widely used in web development, data science, artificial intelligence, automation, and more. Python was created by Guido van Rossum and was first released in 1991.",
            "hello": "Hello! I'm your AI assistant. I can help you with academic questions, programming concepts, and study materials. How can I assist you today?",
            "help": "I can help you with:\n• Programming concepts and syntax\n• Academic subjects and study tips\n• Previous year question papers\n• General academic guidance\n\nFeel free to ask me anything!"
        }
        
        message_lower = request.message.lower()
        response_text = mock_responses.get(message_lower)
        
        if not response_text:
            if "python" in message_lower:
                response_text = "Python is a versatile programming language. Could you be more specific about what aspect of Python you'd like to know about?"
            elif any(word in message_lower for word in ["hello", "hi", "hey"]):
                response_text = "Hello! I'm here to help with your academic questions. What would you like to learn about?"
            else:
                response_text = f"I understand you're asking about: '{request.message}'. While I'm running in demo mode (Gemini API key not configured), I can still help with basic questions about programming, academics, and study materials. Please try asking about Python, programming concepts, or say 'help' for more options."
        
        return ChatResponse(
            response=response_text,
            model_used="mock-response (Gemini API not configured)",
            success=True
        )
    
    try:
        # Prepare the prompt with context
        prompt = f"{request.context}\n\nUser: {request.message}\nAssistant:"
        
        # Generate response
        response = model.generate_content(prompt)
        
        return ChatResponse(
            response=response.text,
            model_used="gemini-1.5-flash",
            success=True
        )
        
    except Exception as e:
        # Fallback to mock response if API fails
        return ChatResponse(
            response=f"I'm currently experiencing some technical difficulties with my AI model. However, I can tell you that your question about '{request.message}' is interesting! For now, I'm running in limited mode. Please try again later or contact support if the issue persists.",
            model_used="fallback-response",
            success=True
        )

# Mock data for papers
MOCK_PAPERS = [
    {
        "id": 1,
        "title": "Data Structures and Algorithms - Final Exam 2023",
        "subject": "Computer Science",
        "stream": "Engineering",
        "year": 2023,
        "semester": "Semester 6",
        "university": "Delhi University",
        "difficulty": "Medium",
        "tags": ["algorithms", "data-structures", "programming"],
        "uploadedAt": "2024-01-15T10:30:00Z",
        "downloadCount": 1250,
        "rating": 4.8,
        "fileSize": "2.4 MB",
        "pages": 12
    },
    {
        "id": 2,
        "title": "Organic Chemistry - Mid-term Examination",
        "subject": "Chemistry",
        "stream": "Science",
        "year": 2023,
        "semester": "Semester 4",
        "university": "Mumbai University",
        "difficulty": "Hard",
        "tags": ["organic-chemistry", "reactions", "mechanisms"],
        "uploadedAt": "2024-01-10T14:20:00Z",
        "downloadCount": 890,
        "rating": 4.6,
        "fileSize": "1.8 MB",
        "pages": 8
    },
    {
        "id": 3,
        "title": "Financial Accounting - Annual Exam 2023",
        "subject": "Accounting",
        "stream": "Commerce",
        "year": 2023,
        "semester": "Semester 2",
        "university": "Calcutta University",
        "difficulty": "Easy",
        "tags": ["accounting", "finance", "balance-sheet"],
        "uploadedAt": "2024-01-08T09:15:00Z",
        "downloadCount": 2100,
        "rating": 4.9,
        "fileSize": "3.1 MB",
        "pages": 16
    }
]

@app.get("/api/v1/papers")
async def search_papers(
    q: str = "",
    subject: Optional[str] = None,
    stream: Optional[str] = None,
    year: Optional[int] = None,
    featured: Optional[bool] = None,
    limit: int = 10
):
    """Search papers endpoint to match frontend expectations."""
    
    # Filter mock papers based on query parameters
    filtered_papers = MOCK_PAPERS.copy()
    
    if subject:
        filtered_papers = [p for p in filtered_papers if subject.lower() in p["subject"].lower()]
    
    if stream:
        filtered_papers = [p for p in filtered_papers if stream.lower() in p["stream"].lower()]
    
    if year:
        filtered_papers = [p for p in filtered_papers if p["year"] == year]
    
    # Apply limit
    filtered_papers = filtered_papers[:limit]
    
    return {
        "papers": filtered_papers,
        "total": len(filtered_papers),
        "page": 1,
        "limit": limit,
        "hasNext": False
    }

@app.get("/test")
async def test_gemini():
    """Test Gemini API connection."""
    
    if not model:
        return {
            "status": "error",
            "message": "Gemini API not configured"
        }
    
    try:
        response = model.generate_content("Hello! Can you help students with academic questions?")
        return {
            "status": "success",
            "message": "Gemini API is working",
            "test_response": response.text
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini API error: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Smart PYQ Chatbot Server...")
    print(f"📡 Gemini API: {'✅ Configured' if model else '❌ Not configured'}")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)