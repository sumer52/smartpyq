#!/usr/bin/env python3
"""
Enhanced FastAPI server with Gemini chatbot integration.
Includes session management, conversation history, streaming, and production features.
"""

import os
import logging
import json
import time
import hashlib
import asyncio
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional, Dict, List, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv
import httpx
import redis
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from cachetools import TTLCache

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
MAX_CONVERSATION_TOKENS = int(os.getenv('MAX_CONVERSATION_TOKENS', '8000'))
CONVERSATION_TRIM_TOKENS = int(os.getenv('CONVERSATION_TRIM_TOKENS', '6000'))
GEMINI_MODEL = os.getenv('GEMINI_MODEL_NAME', 'gemini-1.5-flash')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
USE_REDIS = os.getenv('USE_REDIS', 'false').lower() == 'true'
API_SECRET_KEY = os.getenv('API_SECRET_KEY', 'your-secret-api-key')

# Initialize stores
conversation_store: Dict[str, List[Dict]] = defaultdict(list)  # In-memory store
query_cache = TTLCache(maxsize=1000, ttl=3600)  # Cache for 1 hour
rate_limiter = Limiter(key_func=get_remote_address)

# Redis client (optional)
redis_client = None
if USE_REDIS:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        redis_client.ping()
        logger.info("✅ Redis connected successfully")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Using in-memory store.")
        redis_client = None

# Initialize FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Smart PYQ Chatbot Server...")
    yield
    logger.info("🛑 Shutting down server...")

app = FastAPI(
    title="Smart PYQ Chatbot API",
    description="AI-powered chatbot with Gemini integration, session management, and production features",
    version="2.0.0",
    lifespan=lifespan
)

# Add rate limiting error handler
app.state.limiter = rate_limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
if api_key and api_key != "your_gemini_api_key":
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,
            top_p=0.8,
            top_k=10,
            max_output_tokens=1024,
        )
    )
    logger.info(f"✅ Gemini API configured with model: {GEMINI_MODEL}")
else:
    model = None
    logger.warning("❌ Gemini API key not configured")

# Pydantic Models
class ChatRequest(BaseModel):
    user_id: str = Field(..., description="Unique identifier for the user")
    message: str = Field(..., min_length=1, max_length=1000, description="User's message")
    session_id: Optional[str] = Field(None, description="Session identifier (auto-generated if not provided)")
    stream: bool = Field(False, description="Enable streaming responses")
    
class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI assistant's response")
    session_id: str = Field(..., description="Session identifier")
    model_used: str = Field(..., description="AI model used for response")
    success: bool = Field(..., description="Whether the request was successful")
    conversation_length: int = Field(..., description="Number of messages in conversation")
    tokens_used: Optional[int] = Field(None, description="Estimated tokens used")

class ConversationMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float
    tokens: Optional[int] = None

# Helper Functions
def generate_session_id() -> str:
    """Generate a unique session ID."""
    return hashlib.md5(f"{time.time()}".encode()).hexdigest()[:16]

def estimate_tokens(text: str) -> int:
    """Rough token estimation (4 characters ≈ 1 token)."""
    return len(text) // 4

def get_conversation_key(user_id: str, session_id: str) -> str:
    """Generate conversation storage key."""
    return f"conv:{user_id}:{session_id}"

async def get_conversation(user_id: str, session_id: str) -> List[ConversationMessage]:
    """Retrieve conversation history."""
    key = get_conversation_key(user_id, session_id)
    
    if redis_client:
        try:
            data = redis_client.get(key)
            if data:
                messages_data = json.loads(data)
                return [ConversationMessage(**msg) for msg in messages_data]
        except Exception as e:
            logger.error(f"Redis get error: {e}")
    
    # Fallback to in-memory store
    messages_data = conversation_store.get(key, [])
    return [ConversationMessage(**msg) for msg in messages_data] if messages_data else []

async def save_conversation(user_id: str, session_id: str, messages: List[ConversationMessage]):
    """Save conversation history."""
    key = get_conversation_key(user_id, session_id)
    messages_data = [msg.dict() for msg in messages]
    
    if redis_client:
        try:
            redis_client.setex(key, 86400, json.dumps(messages_data))  # 24 hours TTL
            return
        except Exception as e:
            logger.error(f"Redis set error: {e}")
    
    # Fallback to in-memory store
    conversation_store[key] = messages_data

def trim_conversation(messages: List[ConversationMessage]) -> List[ConversationMessage]:
    """Trim conversation if it exceeds token limit."""
    total_tokens = sum(estimate_tokens(msg.content) for msg in messages)
    
    if total_tokens <= MAX_CONVERSATION_TOKENS:
        return messages
    
    logger.info(f"Trimming conversation: {total_tokens} -> {CONVERSATION_TRIM_TOKENS} tokens")
    
    # Keep system message (if any) and trim from the beginning
    trimmed = []
    current_tokens = 0
    
    # Add messages from the end until we hit the limit
    for msg in reversed(messages):
        msg_tokens = estimate_tokens(msg.content)
        if current_tokens + msg_tokens <= CONVERSATION_TRIM_TOKENS:
            trimmed.insert(0, msg)
            current_tokens += msg_tokens
        else:
            break
    
    return trimmed

async def generate_cache_key(user_message: str, conversation: List[ConversationMessage]) -> str:
    """Generate cache key for responses."""
    context = " ".join([msg.content for msg in conversation[-3:]])  # Last 3 messages
    cache_input = f"{context}:{user_message}"
    return hashlib.md5(cache_input.encode()).hexdigest()

async def call_gemini_api(messages: List[ConversationMessage], user_message: str) -> tuple[str, bool]:
    """Call Gemini API with conversation context."""
    try:
        # Build conversation context
        context_parts = []
        system_context = """You are a helpful AI assistant for students. Provide clear, educational responses about:
- Programming concepts and languages
- Academic subjects (math, science, etc.)  
- Study techniques and exam preparation
- Technology and computer science topics
Keep responses concise but informative, suitable for learning."""
        
        context_parts.append(f"System: {system_context}")
        
        # Add conversation history
        for msg in messages[-10:]:  # Last 10 messages for context
            role = "Human" if msg.role == "user" else "Assistant"
            context_parts.append(f"{role}: {msg.content}")
        
        context_parts.append(f"Human: {user_message}")
        context_parts.append("Assistant:")
        
        full_prompt = "\n\n".join(context_parts)
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        if response.text:
            return response.text.strip(), True
        else:
            logger.error("Gemini returned empty response")
            return "I apologize, but I couldn't generate a response. Please try again.", False
            
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return "I'm experiencing technical difficulties. Please try again later.", False

async def stream_gemini_response(messages: List[ConversationMessage], user_message: str):
    """Stream response from Gemini (if supported)."""
    try:
        # Build context similar to regular call
        context_parts = []
        system_context = """You are a helpful AI assistant for students. Provide clear, educational responses about:
- Programming concepts and languages
- Academic subjects (math, science, etc.)
- Study techniques and exam preparation  
- Technology and computer science topics
Keep responses concise but informative, suitable for learning."""
        
        context_parts.append(f"System: {system_context}")
        
        for msg in messages[-10:]:
            role = "Human" if msg.role == "user" else "Assistant"
            context_parts.append(f"{role}: {msg.content}")
        
        context_parts.append(f"Human: {user_message}")
        context_parts.append("Assistant:")
        
        full_prompt = "\n\n".join(context_parts)
        
        # Use streaming if supported
        response = model.generate_content(full_prompt, stream=True)
        
        for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'content': chunk.text, 'done': False})}\n\n"
                await asyncio.sleep(0.01)  # Small delay for smooth streaming
        
        yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
        
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        yield f"data: {json.dumps({'error': 'Streaming failed', 'done': True})}\n\n"

def verify_api_key(request: Request) -> bool:
    """Verify API key for server-to-server requests."""
    api_key = request.headers.get("X-API-Key")
    return api_key == API_SECRET_KEY

# API Endpoints
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
    """Chat with the AI assistant powered by Gemini API."""
    import httpx
    import logging
    
    # Fallback response if Gemini fails
    FALLBACK_RESPONSE = "Sorry, I'm experiencing technical difficulties. Please try again later."
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == "your_gemini_api_key":
        logging.warning("Gemini API key not configured, using fallback")
        return ChatResponse(
            response=FALLBACK_RESPONSE,
            model_used="fallback",
            success=False
        )
    
    try:
        # Prepare Gemini API request
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Enhanced context for academic assistant
        system_context = """You are a helpful AI assistant for students. Provide clear, educational responses about:
        - Programming concepts and languages
        - Academic subjects (math, science, etc.)
        - Study techniques and exam preparation
        - Technology and computer science topics
        Keep responses concise but informative, suitable for learning."""
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"{system_context}\n\nStudent question: {request.message}\n\nResponse:"
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
                "topP": 0.8,
                "topK": 10
            }
        }
        
        # Make async HTTP request to Gemini API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(gemini_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'candidates' in data and len(data['candidates']) > 0:
                    gemini_text = data['candidates'][0]['content']['parts'][0]['text']
                    return ChatResponse(
                        response=gemini_text.strip(),
                        model_used="gemini-1.5-flash",
                        success=True
                    )
                else:
                    logging.error(f"Gemini API returned no candidates: {data}")
                    raise Exception("No response candidates from Gemini")
            else:
                logging.error(f"Gemini API error {response.status_code}: {response.text}")
                raise Exception(f"Gemini API returned {response.status_code}")
                
    except httpx.TimeoutException:
        logging.error("Gemini API request timeout")
    except httpx.RequestError as e:
        logging.error(f"Gemini API request error: {e}")
    except Exception as e:
        logging.error(f"Gemini API integration error: {e}")
    
    # Return fallback response on any error
    return ChatResponse(
        response=FALLBACK_RESPONSE,
        model_used="fallback",
        success=False
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