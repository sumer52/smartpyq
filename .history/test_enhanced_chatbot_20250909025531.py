#!/usr/bin/env python3
"""
Unit tests for the enhanced Smart PYQ Chatbot API.
Run with: pytest test_enhanced_chatbot.py -v
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient

# Import your enhanced server
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock the dependencies before importing
with patch.dict(os.environ, {'GEMINI_API_KEY': 'test_key', 'USE_REDIS': 'false'}):
    from simple_server import app, estimate_tokens, trim_conversation, ConversationMessage

client = TestClient(app)

class TestChatbotAPI:
    
    def test_root_endpoint(self):
        """Test root endpoint returns correct information."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "status" in data
        assert data["status"] == "running"
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "gemini_api" in data
    
    def test_chat_missing_user_id(self):
        """Test chat endpoint with missing user_id."""
        response = client.post("/api/v1/chat", json={
            "message": "Hello"
        })
        assert response.status_code == 422  # Validation error
    
    def test_chat_empty_message(self):
        """Test chat endpoint with empty message."""
        response = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": ""
        })
        assert response.status_code == 422  # Validation error
    
    def test_chat_long_message(self):
        """Test chat endpoint with message too long."""
        long_message = "x" * 1001  # Exceeds 1000 char limit
        response = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": long_message
        })
        assert response.status_code == 422  # Validation error
    
    @patch('simple_server.model')
    def test_chat_no_gemini_api(self, mock_model):
        """Test chat endpoint when Gemini API is not configured."""
        mock_model.return_value = None
        
        response = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": "Hello, how are you?"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert not data["success"]
        assert data["model_used"] == "fallback"
        assert "session_id" in data
        assert data["conversation_length"] == 0
    
    @patch('simple_server.call_gemini_api')
    @patch('simple_server.model')
    def test_successful_chat(self, mock_model, mock_gemini):
        """Test successful chat interaction."""
        mock_model.return_value = Mock()
        mock_gemini.return_value = ("Hello! How can I help you today?", True)
        
        response = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": "Hello, how are you?"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"]
        assert "reply" in data
        assert "session_id" in data
        assert data["conversation_length"] > 0
    
    def test_conversation_history_no_api_key(self):
        """Test conversation history endpoint without API key."""
        response = client.get("/api/v1/conversation/test_user/test_session")
        assert response.status_code == 403
    
    def test_conversation_history_with_api_key(self):
        """Test conversation history endpoint with API key."""
        response = client.get(
            "/api/v1/conversation/test_user/test_session",
            headers={"X-API-Key": "your-secret-api-key"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "session_id" in data
        assert "messages" in data
    
    def test_clear_conversation_with_api_key(self):
        """Test clearing conversation with API key."""
        response = client.delete(
            "/api/v1/conversation/test_user/test_session",
            headers={"X-API-Key": "your-secret-api-key"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestUtilityFunctions:
    
    def test_estimate_tokens(self):
        """Test token estimation function."""
        assert estimate_tokens("") == 0
        assert estimate_tokens("test") == 1
        assert estimate_tokens("a" * 8) == 2
        assert estimate_tokens("Hello world! How are you today?") >= 6
    
    def test_conversation_message_creation(self):
        """Test ConversationMessage model."""
        msg = ConversationMessage(
            role="user",
            content="Hello",
            timestamp=1234567890.0,
            tokens=5
        )
        
        assert msg.role == "user"
        assert msg.content == "Hello"
        assert msg.timestamp == 1234567890.0
        assert msg.tokens == 5
    
    def test_trim_conversation_under_limit(self):
        """Test conversation trimming when under token limit."""
        messages = [
            ConversationMessage(role="user", content="Hi", timestamp=1.0),
            ConversationMessage(role="assistant", content="Hello", timestamp=2.0)
        ]
        
        # Should return same messages if under limit
        trimmed = trim_conversation(messages)
        assert len(trimmed) == len(messages)
        assert trimmed == messages
    
    def test_trim_conversation_over_limit(self):
        """Test conversation trimming when over token limit."""
        # Create many messages that exceed token limit
        messages = []
        for i in range(100):
            messages.append(ConversationMessage(
                role="user" if i % 2 == 0 else "assistant",
                content="x" * 100,  # 25 tokens each
                timestamp=float(i)
            ))
        
        # Should trim from beginning
        trimmed = trim_conversation(messages)
        assert len(trimmed) < len(messages)
        
        # Should keep recent messages
        assert trimmed[-1] == messages[-1]


class TestRateLimiting:
    
    def test_rate_limit_exceeded(self):
        """Test rate limiting (this may need adjustment based on your rate limits)."""
        # Make many requests quickly to trigger rate limit
        responses = []
        for i in range(35):  # Exceed 30/minute limit
            response = client.post("/api/v1/chat", json={
                "user_id": f"test_user_{i}",
                "message": f"Message {i}"
            })
            responses.append(response.status_code)
        
        # Some should be rate limited (429)
        assert 429 in responses


class TestStreamingEndpoint:
    
    def test_streaming_request(self):
        """Test streaming chat request."""
        response = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": "Tell me about Python",
            "stream": True
        })
        
        # Should return streaming response
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"


# Performance Tests
class TestPerformance:
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test handling multiple concurrent requests."""
        async def make_request():
            return client.post("/api/v1/chat", json={
                "user_id": "test_user",
                "message": "Hello"
            })
        
        # Make 10 concurrent requests
        tasks = [make_request() for _ in range(10)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All should complete successfully
        for response in responses:
            assert not isinstance(response, Exception)
    
    def test_large_conversation_handling(self):
        """Test handling of large conversation history."""
        # This would need to be implemented based on your session storage
        pass


# Integration Tests
class TestIntegration:
    
    @patch('simple_server.redis_client')
    def test_redis_integration(self, mock_redis):
        """Test Redis integration for conversation storage."""
        mock_redis.get.return_value = json.dumps([])
        mock_redis.setex.return_value = True
        
        response = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": "Hello"
        })
        
        assert response.status_code == 200
    
    def test_cache_functionality(self):
        """Test caching of repeated queries."""
        # First request
        response1 = client.post("/api/v1/chat", json={
            "user_id": "test_user", 
            "message": "What is Python?"
        })
        
        # Second identical request (should hit cache)
        response2 = client.post("/api/v1/chat", json={
            "user_id": "test_user",
            "message": "What is Python?"
        })
        
        assert response1.status_code == 200
        assert response2.status_code == 200


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
