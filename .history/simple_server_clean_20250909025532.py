#!/usr/bin/env python3
"""
Clean FastAPI server with Gemini chatbot integration.
Compatible with existing frontend, answers any user question intelligently.
"""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Smart PYQ Chatbot API",
    description="AI-powered chatbot with Gemini integration for intelligent responses",
    version="2.0.0"
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
model = None

if api_key and api_key != "your_gemini_api_key":
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info("✅ Gemini API: Configured")
    except Exception as e:
        logger.error(f"Gemini configuration failed: {e}")
        model = None
else:
    logger.warning("❌ Gemini API: Not configured")

# Request/Response Models (compatible with existing frontend)
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[str] = "You are a helpful AI assistant for students. Help them with academic questions, study tips, and previous year question papers."

class ChatResponse(BaseModel):
    response: str
    model_used: str
    success: bool

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Smart PYQ Chatbot API v2.0",
        "status": "running",
        "gemini_configured": model is not None
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "gemini_api": "configured" if model else "not configured",
        "message": "Bot ready to answer any question!"
    }

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Enhanced chat endpoint that answers ANY question using Gemini AI.
    Compatible with existing frontend - no changes needed!
    """
    
    # Fallback response if Gemini fails
    FALLBACK_RESPONSE = "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment."
    
    # Check if Gemini is configured
    if not model:
        logger.warning("Gemini API not configured")
        return ChatResponse(
            response="I'm currently in offline mode. Please check my configuration and try again.",
            model_used="offline",
            success=False
        )
    
    try:
        # Prepare the enhanced system context
        system_context = """You are an intelligent AI assistant that can help with ANY topic or question. You are knowledgeable about:

🎓 ACADEMIC SUBJECTS: Math, Science, History, Literature, Languages, etc.
💻 PROGRAMMING: Python, JavaScript, Java, C++, web development, algorithms, debugging
📚 STUDY HELP: Exam preparation, learning strategies, research assistance
🔬 TECHNOLOGY: AI, machine learning, software development, hardware, latest tech trends
🌍 GENERAL KNOWLEDGE: Current events, geography, culture, sports, entertainment
💡 PROBLEM SOLVING: Logic puzzles, critical thinking, creative solutions
📖 WRITING HELP: Essays, reports, creative writing, grammar, style

Instructions:
- Give clear, helpful, and accurate responses
- Use examples when explaining complex topics
- Be conversational and friendly
- If you're not sure about something, say so honestly
- For programming questions, provide working code examples
- For academic topics, explain concepts step by step
- Always aim to be educational and informative

"""

        # Combine system context with user message
        full_prompt = f"{system_context}\n\nUser Question: {request.message}\n\nResponse:"
        
        # Generate response using Gemini
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.8,
                top_k=10,
                max_output_tokens=1000,
            )
        )
        
        if response.text:
            ai_response = response.text.strip()
            logger.info(f"Gemini response generated successfully for: {request.message[:50]}...")
            
            return ChatResponse(
                response=ai_response,
                model_used="gemini-1.5-flash",
                success=True
            )
        else:
            logger.error("Gemini returned empty response")
            return ChatResponse(
                response="I'm having trouble generating a response right now. Could you please rephrase your question?",
                model_used="gemini-1.5-flash",
                success=False
            )
            
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return ChatResponse(
            response=FALLBACK_RESPONSE,
            model_used="fallback",
            success=False
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run("simple_server_clean:app", host="0.0.0.0", port=port, reload=True)
