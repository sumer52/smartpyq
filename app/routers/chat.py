"""Chat API Routes

Handles AI chatbot interactions, streaming responses, and session management.
"""

import json
from datetime import datetime
from typing import List, Optional, AsyncGenerator

from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    status,
    Request
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sse_starlette import EventSourceResponse

from ..core.dependencies import (
    get_current_active_user,
    get_current_tenant,
    get_client_ip
)
from ..core.exceptions import (
    ValidationError,
    RateLimitError,
    NotFoundError
)
from ..models.user import User
from ..models.tenant import Tenant
from ..services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])

# Request/Response Models
class ChatRequest(BaseModel):
    """Chat message request"""
    prompt: str = Field(..., min_length=1, max_length=4000, description="User message")
    session_id: Optional[str] = Field(None, description="Chat session ID (optional for new session)")
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional context metadata")
    stream: bool = Field(default=True, description="Enable streaming response")
    
class ChatResponse(BaseModel):
    """Chat response model"""
    session_id: str
    message_id: int
    response: str
    tokens_used: int
    model_used: str
    created_at: datetime
    
class ChatMessage(BaseModel):
    """Chat message model"""
    id: int
    role: str  # user, assistant, system
    content: str
    tokens_used: int
    created_at: datetime
    
class ChatSession(BaseModel):
    """Chat session model"""
    id: int
    session_uuid: str
    started_at: datetime
    message_count: int
    total_tokens: int
    
class ChatHistoryResponse(BaseModel):
    """Chat history response"""
    session: ChatSession
    messages: List[ChatMessage]
    
class SessionListResponse(BaseModel):
    """User chat sessions list"""
    sessions: List[ChatSession]
    total: int
    
class StreamChunk(BaseModel):
    """Streaming response chunk"""
    session_id: str
    content: str
    finished: bool = False
    tokens_used: Optional[int] = None
    error: Optional[str] = None

# Initialize service
chat_service = ChatService()

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Send chat message to AI assistant
    
    Processes user message and returns AI response. Supports both streaming
    and non-streaming modes. Creates new session if session_id not provided.
    """
    try:
        # For non-streaming requests
        if not request.stream:
            result = await chat_service.process_chat(
                user_id=current_user.id,
                tenant_id=current_tenant.id,
                prompt=request.prompt,
                session_id=request.session_id,
                metadata=request.metadata,
                client_ip=client_ip,
                stream=False
            )
            
            return ChatResponse(**result)
        else:
            # For streaming requests, redirect to stream endpoint
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Use /chat/stream endpoint for streaming responses"
            )
            
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except RateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat processing failed. Please try again."
        )

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    current_tenant: Tenant = Depends(get_current_tenant),
    client_ip: str = Depends(get_client_ip)
):
    """Stream chat response using Server-Sent Events
    
    Returns streaming response for real-time chat experience.
    Each chunk contains partial response content.
    """
    async def generate_stream() -> AsyncGenerator[str, None]:
        try:
            async for chunk in chat_service.process_chat_stream(
                user_id=current_user.id,
                tenant_id=current_tenant.id,
                prompt=request.prompt,
                session_id=request.session_id,
                metadata=request.metadata,
                client_ip=client_ip
            ):
                # Format as SSE event
                chunk_data = StreamChunk(**chunk)
                yield f"data: {chunk_data.json()}\n\n"
                
                # Send final event when finished
                if chunk_data.finished:
                    break
                    
        except ValidationError as e:
            error_chunk = StreamChunk(
                session_id=request.session_id or "unknown",
                content="",
                finished=True,
                error=str(e)
            )
            yield f"data: {error_chunk.json()}\n\n"
            
        except RateLimitError as e:
            error_chunk = StreamChunk(
                session_id=request.session_id or "unknown",
                content="",
                finished=True,
                error=f"Rate limit exceeded: {str(e)}"
            )
            yield f"data: {error_chunk.json()}\n\n"
            
        except Exception as e:
            error_chunk = StreamChunk(
                session_id=request.session_id or "unknown",
                content="",
                finished=True,
                error="Chat processing failed. Please try again."
            )
            yield f"data: {error_chunk.json()}\n\n"
    
    return EventSourceResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

@router.get("/sessions", response_model=SessionListResponse)
async def get_user_sessions(
    page: int = 1,
    per_page: int = 20,
    current_user: User = Depends(get_current_active_user)
):
    """Get user's chat sessions
    
    Returns paginated list of user's chat sessions with basic info.
    """
    try:
        result = await chat_service.get_user_sessions(
            user_id=current_user.id,
            page=page,
            per_page=per_page
        )
        
        return SessionListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat sessions"
        )

@router.get("/{session_id}/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get chat session history
    
    Returns complete message history for specified session.
    Only accessible by session owner.
    """
    try:
        result = await chat_service.get_chat_history(
            session_id=session_id,
            user_id=current_user.id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
            
        return ChatHistoryResponse(**result)
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat history"
        )

@router.delete("/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    client_ip: str = Depends(get_client_ip)
):
    """Delete chat session
    
    Permanently removes chat session and all associated messages.
    Only accessible by session owner.
    """
    try:
        await chat_service.delete_session(
            session_id=session_id,
            user_id=current_user.id,
            client_ip=client_ip
        )
        
        return {"message": "Chat session deleted successfully"}
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat session"
        )

@router.post("/sessions/{session_id}/clear")
async def clear_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    client_ip: str = Depends(get_client_ip)
):
    """Clear chat session messages
    
    Removes all messages from session but keeps session metadata.
    Useful for starting fresh conversation in existing session.
    """
    try:
        await chat_service.clear_session(
            session_id=session_id,
            user_id=current_user.id,
            client_ip=client_ip
        )
        
        return {"message": "Chat session cleared successfully"}
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear chat session"
        )

@router.get("/models")
async def get_available_models(
    current_user: User = Depends(get_current_active_user)
):
    """Get available AI models
    
    Returns list of available AI models and their capabilities.
    """
    try:
        models = await chat_service.get_available_models()
        return {"models": models}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve available models"
        )

@router.get("/stats")
async def get_chat_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get user's chat statistics
    
    Returns usage statistics including message count, token usage, etc.
    """
    try:
        stats = await chat_service.get_user_stats(
            user_id=current_user.id
        )
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat statistics"
        )

# WebSocket endpoint for real-time chat (alternative to SSE)
@router.websocket("/ws/{session_id}")
async def websocket_chat(
    websocket,
    session_id: str,
    # Note: WebSocket authentication would need custom implementation
    # current_user: User = Depends(get_current_active_user)  # Not supported in WebSocket
):
    """WebSocket endpoint for real-time chat
    
    Alternative to SSE for browsers that prefer WebSocket connections.
    Requires custom authentication via query params or headers.
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # TODO: Implement WebSocket authentication
            # For now, this is a placeholder implementation
            
            # Process chat message
            # This would integrate with chat_service.process_chat_stream
            
            # Send response back to client
            await websocket.send_text(json.dumps({
                "type": "message",
                "content": "WebSocket chat not fully implemented yet",
                "session_id": session_id
            }))
            
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Connection error occurred"
        }))
    finally:
        await websocket.close()