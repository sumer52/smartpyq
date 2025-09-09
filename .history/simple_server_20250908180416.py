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
    
    # Always provide a mock response for now since Gemini API isn't properly configured
    mock_responses = {
        # Greetings
        "hello": "Hello! I'm your AI assistant. I can help you with academic questions, programming concepts, and study materials. How can I assist you today?",
        "hi": "Hi there! I'm here to help with your studies. What would you like to know?",
        "hey": "Hey! Ready to learn something new? Ask me about programming, academics, or study tips!",
        
        # Help and general
        "help": "I can help you with:\n• Programming concepts and syntax\n• Academic subjects and study tips\n• Previous year question papers\n• General academic guidance\n\nFeel free to ask me anything!",
        
        # Programming Languages
        "what is python": "Python is a high-level, interpreted programming language known for its simplicity and readability. It's widely used in web development, data science, artificial intelligence, automation, and more. Python was created by Guido van Rossum and was first released in 1991.",
        "what is java": "Java is a high-level, object-oriented programming language developed by Sun Microsystems (now Oracle). It's known for its 'write once, run anywhere' capability, making it popular for enterprise applications, Android development, and web services.",
        "what is javascript": "JavaScript is a dynamic programming language primarily used for web development. It enables interactive web pages and is an essential part of web applications alongside HTML and CSS. It can also be used for server-side development with Node.js.",
        "what is c++": "C++ is a general-purpose programming language created by Bjarne Stroustrup. It's an extension of C with object-oriented features. C++ is widely used for system programming, game development, and applications requiring high performance.",
        
        # Computer Science Concepts  
        "what is machine learning": "Machine Learning is a branch of artificial intelligence (AI) that enables computers to learn and make decisions from data without being explicitly programmed. It includes techniques like supervised learning, unsupervised learning, and reinforcement learning.",
        "explain algorithms": "An algorithm is a step-by-step procedure or set of rules to solve a problem or complete a task. In programming, algorithms define how data is processed and manipulated. Examples include sorting algorithms (bubble sort, merge sort) and search algorithms (binary search).",
        "what are data structures": "Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, and hash tables.",
        "explain functions": "Functions are reusable blocks of code that perform specific tasks. They take input parameters, process them, and return a result. Functions help organize code, reduce repetition, and make programs more modular and easier to maintain.",
        "explain functions in programming": "Functions in programming are reusable code blocks that perform specific tasks. They accept parameters as input, execute a set of instructions, and often return a value. Functions promote code reusability, modularity, and easier debugging.",
        
        # Database and Systems
        "tell me about databases": "A database is an organized collection of structured information stored electronically. Popular types include relational databases (MySQL, PostgreSQL), NoSQL databases (MongoDB, Redis), and cloud databases. They help store, retrieve, and manage data efficiently.",
        "what is sql": "SQL (Structured Query Language) is a programming language designed for managing and manipulating relational databases. It allows you to create, read, update, and delete data using commands like SELECT, INSERT, UPDATE, and DELETE.",
        
        # Study Tips
        "how to study effectively": "Effective study tips:\n• Break study sessions into manageable chunks (Pomodoro technique)\n• Practice active recall and spaced repetition\n• Solve previous year questions\n• Create summary notes and mind maps\n• Form study groups for discussion\n• Take regular breaks and maintain good sleep",
        "study tips": "Here are proven study strategies:\n• Set specific goals for each session\n• Use active learning techniques\n• Practice with past papers\n• Teach concepts to others\n• Stay organized with a study schedule\n• Minimize distractions during study time",
        
        # Academic Subjects
        "what is mathematics": "Mathematics is the study of numbers, shapes, patterns, and relationships. It includes branches like algebra, calculus, geometry, statistics, and discrete mathematics. Math is fundamental to science, engineering, economics, and computer science.",
        "what is physics": "Physics is the science that studies matter, energy, and their interactions in the universe. It covers topics like mechanics, thermodynamics, electromagnetism, quantum mechanics, and relativity. Physics forms the foundation for engineering and technology.",
        "what is chemistry": "Chemistry is the science of atoms, molecules, and their interactions. It studies the composition, structure, properties, and behavior of matter. Major branches include organic, inorganic, physical, and analytical chemistry."
    }
    
    message_lower = request.message.lower().strip()
    response_text = mock_responses.get(message_lower)
    
    if not response_text:
        # Enhanced keyword matching for better responses
        if "python" in message_lower:
            response_text = "Python is a versatile programming language. Could you be more specific about what aspect of Python you'd like to know about? For example: syntax, libraries, applications, or career opportunities?"
        elif "java" in message_lower:
            response_text = "Java is a powerful programming language. What specifically would you like to know? Object-oriented programming, syntax, applications, or how it compares to other languages?"
        elif "algorithm" in message_lower:
            response_text = "Algorithms are fundamental to computer science! They're step-by-step procedures for solving problems. Would you like to know about specific algorithms like sorting, searching, or algorithm analysis?"
        elif "data structure" in message_lower:
            response_text = "Data structures are crucial for efficient programming! They include arrays, linked lists, stacks, queues, trees, and graphs. Which data structure interests you most?"
        elif "machine learning" in message_lower or "ml" in message_lower:
            response_text = "Machine Learning is fascinating! It's about teaching computers to learn from data. Are you interested in supervised learning, unsupervised learning, or specific ML algorithms?"
        elif "database" in message_lower or "sql" in message_lower:
            response_text = "Databases are essential for storing and managing data! Would you like to know about database design, SQL queries, or different types of databases?"
        elif "study" in message_lower or "exam" in message_lower:
            response_text = "Great question about studying! Effective study techniques include active recall, spaced repetition, and practice with previous papers. What subject are you preparing for?"
        elif any(word in message_lower for word in ["hello", "hi", "hey"]):
            response_text = "Hello! I'm here to help with your academic questions. What would you like to learn about today?"
        else:
            response_text = f"Thanks for asking about '{request.message}'! I can help with programming concepts, academic subjects, and study strategies. Try asking about specific topics like Python, algorithms, data structures, or study tips. Type 'help' for more options!"
    
    return ChatResponse(
        response=response_text,
        model_used="enhanced-demo-mode",
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