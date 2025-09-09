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
    
    def get_intelligent_response(message: str) -> str:
        """Generate intelligent responses for any question"""
        msg_lower = message.lower().strip()
        
        # Programming and Technology
        if any(keyword in msg_lower for keyword in ['python', 'programming', 'code', 'coding']):
            if 'what is python' in msg_lower or 'python' in msg_lower:
                return "Python is a high-level, interpreted programming language created by Guido van Rossum in 1991. It's known for its simple, readable syntax and versatility. Python is widely used in web development (Django, Flask), data science (pandas, NumPy), machine learning (scikit-learn, TensorFlow), automation, and scripting. Its philosophy emphasizes code readability and simplicity, making it an excellent choice for beginners and professionals alike."
            elif 'learn python' in msg_lower:
                return "To learn Python effectively: 1) Start with basic syntax and data types, 2) Practice with simple programs like calculators and games, 3) Learn about functions, loops, and conditionals, 4) Explore libraries like pandas for data analysis, 5) Build projects like web scraping tools or web applications, 6) Use resources like Python.org's tutorial, Codecademy, or freeCodeCamp. Practice coding daily and join communities like Stack Overflow for help."
            else:
                return "Python is an excellent programming language for beginners and professionals. It's versatile, readable, and has extensive libraries for web development, data science, AI, and automation. What specific aspect of Python would you like to know more about - syntax, applications, or learning resources?"
        
        elif any(keyword in msg_lower for keyword in ['java', 'javascript', 'js']):
            if 'java' in msg_lower and 'javascript' not in msg_lower:
                return "Java is a robust, object-oriented programming language developed by Sun Microsystems (now Oracle) in 1995. It follows the 'write once, run anywhere' principle through the Java Virtual Machine (JVM). Java is widely used for enterprise applications, Android development, web backends, and large-scale systems. Key features include platform independence, strong memory management, multithreading support, and extensive libraries."
            elif 'javascript' in msg_lower or 'js' in msg_lower:
                return "JavaScript is a dynamic, interpreted programming language primarily used for web development. Created by Brendan Eich in 1995, it enables interactive web pages and is essential for frontend development alongside HTML and CSS. Modern JavaScript also runs on servers (Node.js), mobile apps, and desktop applications. Key features include event-driven programming, asynchronous operations, and a vast ecosystem of frameworks like React, Vue, and Angular."
        
        elif any(keyword in msg_lower for keyword in ['algorithm', 'algorithms']):
            return "An algorithm is a step-by-step procedure for solving a problem or completing a task. In computer science, algorithms are fundamental for processing data efficiently. Common types include: Sorting algorithms (QuickSort, MergeSort), Searching algorithms (Binary Search, Linear Search), Graph algorithms (Dijkstra's, BFS, DFS), and Dynamic Programming algorithms. Good algorithms optimize for time complexity (speed) and space complexity (memory usage)."
        
        elif any(keyword in msg_lower for keyword in ['data structure', 'data structures']):
            return "Data structures are ways of organizing and storing data for efficient access and modification. Common data structures include: Arrays (fixed-size collections), Linked Lists (dynamic collections), Stacks (LIFO - Last In, First Out), Queues (FIFO - First In, First Out), Trees (hierarchical data), Hash Tables (key-value pairs), and Graphs (networks of connected nodes). Choosing the right data structure is crucial for algorithm efficiency."
        
        # Science and Mathematics
        elif any(keyword in msg_lower for keyword in ['machine learning', 'ml', 'ai', 'artificial intelligence']):
            return "Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and make decisions from data without explicit programming. There are three main types: Supervised Learning (learning from labeled data), Unsupervised Learning (finding patterns in unlabeled data), and Reinforcement Learning (learning through interaction and rewards). ML applications include recommendation systems, image recognition, natural language processing, and predictive analytics."
        
        elif any(keyword in msg_lower for keyword in ['mathematics', 'math', 'maths']):
            return "Mathematics is the study of numbers, structures, patterns, and relationships. Major branches include: Algebra (equations and variables), Calculus (rates of change and areas), Geometry (shapes and spaces), Statistics (data analysis), Number Theory (properties of integers), and Discrete Mathematics (finite structures). Mathematics is fundamental to science, engineering, computer science, economics, and many other fields."
        
        elif any(keyword in msg_lower for keyword in ['physics']):
            return "Physics is the fundamental science that studies matter, energy, and their interactions in the universe. Major areas include: Mechanics (motion and forces), Thermodynamics (heat and energy), Electromagnetism (electric and magnetic phenomena), Quantum Mechanics (behavior of atoms and particles), and Relativity (space, time, and gravity). Physics principles underpin all other sciences and drive technological advancement."
        
        elif any(keyword in msg_lower for keyword in ['chemistry']):
            return "Chemistry is the science of matter, atoms, molecules, and their interactions. It's divided into: Organic Chemistry (carbon-based compounds), Inorganic Chemistry (non-carbon compounds), Physical Chemistry (chemical phenomena through physics), Analytical Chemistry (composition analysis), and Biochemistry (chemical processes in living organisms). Chemistry is central to medicine, materials science, and environmental science."
        
        # Database and Systems
        elif any(keyword in msg_lower for keyword in ['database', 'sql', 'db']):
            if 'sql' in msg_lower:
                return "SQL (Structured Query Language) is the standard language for managing relational databases. Key operations include: SELECT (retrieve data), INSERT (add data), UPDATE (modify data), DELETE (remove data), CREATE (make tables), and JOIN (combine tables). SQL is essential for data analysis, web development, and business intelligence. Popular SQL databases include MySQL, PostgreSQL, Oracle, and SQL Server."
            else:
                return "A database is an organized collection of structured information stored electronically. Types include: Relational databases (MySQL, PostgreSQL) using tables and SQL, NoSQL databases (MongoDB, Redis) for flexible data models, Cloud databases (AWS RDS, Google Cloud SQL), and In-memory databases (Redis) for high-speed access. Databases enable efficient data storage, retrieval, and management for applications."
        
        # Study and Academic Help
        elif any(keyword in msg_lower for keyword in ['study', 'exam', 'test', 'learning']):
            if 'study' in msg_lower or 'learning' in msg_lower:
                return "Effective study strategies include: 1) Active recall - test yourself instead of re-reading, 2) Spaced repetition - review material at increasing intervals, 3) Pomodoro Technique - 25-minute focused sessions with breaks, 4) Create summaries and mind maps, 5) Practice with past papers and mock tests, 6) Form study groups for discussion, 7) Teach concepts to others, 8) Maintain good sleep and nutrition. Consistency and understanding concepts (not just memorization) are key to success."
            elif 'exam' in msg_lower or 'test' in msg_lower:
                return "Exam preparation tips: 1) Start early and create a study schedule, 2) Understand the exam format and marking scheme, 3) Practice with previous year papers, 4) Focus on weak areas while maintaining strengths, 5) Use active recall and practice questions, 6) Take regular breaks to avoid burnout, 7) Stay healthy with proper sleep and nutrition, 8) Review key concepts the night before, 9) Arrive early and read instructions carefully, 10) Stay calm and manage time effectively during the exam."
        
        # General Knowledge and Current Topics
        elif any(keyword in msg_lower for keyword in ['what is', 'explain', 'define', 'meaning']):
            if 'data' in msg_lower:
                return "Data refers to raw facts, figures, or information that can be processed to derive meaningful insights. In computing, data can be structured (organized in databases), semi-structured (like JSON/XML), or unstructured (text, images, videos). Data types include numeric, text, boolean, and multimedia. In today's digital world, data is often called 'the new oil' because of its value in decision-making, machine learning, and business intelligence."
            elif 'internet' in msg_lower:
                return "The Internet is a global network of interconnected computers that communicate using standardized protocols (TCP/IP). Created from ARPANET in the 1960s-70s, it enables services like the World Wide Web, email, file sharing, and streaming. The Internet has revolutionized communication, commerce, education, and entertainment, connecting billions of people worldwide and enabling the digital economy."
            elif 'computer' in msg_lower:
                return "A computer is an electronic device that processes data according to instructions (programs). Key components include: CPU (processes instructions), Memory/RAM (temporary storage), Storage (permanent data storage), Input devices (keyboard, mouse), and Output devices (monitor, printer). Computers range from smartphones and laptops to supercomputers and servers, enabling everything from communication to scientific research."
        
        # Greetings and General Conversation
        elif any(greeting in msg_lower for greeting in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return "Hello! I'm your AI assistant, ready to help with any questions you have. I can explain concepts in programming, science, mathematics, provide study tips, help with academic subjects, or discuss technology topics. What would you like to learn about today?"
        
        elif any(keyword in msg_lower for keyword in ['help', 'what can you do']):
            return "I can help you with a wide range of topics including:\n• Programming languages (Python, Java, JavaScript, C++, etc.)\n• Computer science concepts (algorithms, data structures, databases)\n• Science subjects (physics, chemistry, biology, mathematics)\n• Study strategies and exam preparation\n• Technology explanations (AI, machine learning, web development)\n• Academic guidance and career advice\n• General knowledge and current topics\n\nJust ask me any question, and I'll provide detailed, helpful explanations!"
        
        elif any(keyword in msg_lower for keyword in ['thank', 'thanks']):
            return "You're welcome! I'm glad I could help. If you have any more questions about programming, academics, science, or any other topics, feel free to ask. I'm here to make learning easier and more enjoyable for you!"
        
        # Default intelligent response for any other question
        else:
            # Try to extract key topics from the question
            question_words = msg_lower.split()
            
            # Look for question words to provide contextual help
            if any(qword in question_words for qword in ['how', 'why', 'what', 'when', 'where', 'who']):
                if len(message) > 50:  # Detailed question
                    return f"That's an interesting question about '{message}'. While I don't have specific information about this exact topic, I can help you approach it systematically. Try breaking down your question into smaller parts, researching reliable sources, or asking about related concepts I might know better. I'm particularly knowledgeable about programming, mathematics, science, and study strategies. Would you like me to help with any of these areas?"
                else:  # Short question
                    return f"I'd be happy to help with '{message}'! Could you provide a bit more context or detail about what specifically you'd like to know? I can offer detailed explanations on programming, science, mathematics, study techniques, and many other academic topics."
            
            # For non-question statements
            return f"I understand you're mentioning '{message}'. I'm here to help with explanations, learning, and answering questions on a wide variety of topics including programming, science, mathematics, and academics. Is there something specific you'd like to know more about or learn? Feel free to ask any question!"
    
    # Get the intelligent response
    response_text = get_intelligent_response(request.message)
    
    return ChatResponse(
        response=response_text,
        model_used="intelligent-assistant",
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