# Smart PYQ Chatbot - Enhanced Gemini Integration

## 📋 Production Deployment Guide

### 1. Environment Setup

```bash
# Required environment variables (.env file)
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL_NAME=gemini-1.5-flash
USE_REDIS=true
REDIS_URL=redis://localhost:6379
API_SECRET_KEY=your_super_secret_api_key_for_admin_endpoints
MAX_CONVERSATION_TOKENS=8000
CONVERSATION_TRIM_TOKENS=6000
```

### 2. Production Server Setup

#### Option 1: Uvicorn (Development/Testing)
```bash
# Simple development server
uvicorn simple_server:app --host 0.0.0.0 --port 8000 --log-level info

# With auto-reload for development
uvicorn simple_server:app --reload --host 0.0.0.0 --port 8000
```

#### Option 2: Gunicorn + Uvicorn Workers (Production)
```bash
# Install gunicorn
pip install gunicorn[uvicorn]

# Run with multiple workers
gunicorn simple_server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --timeout 120 --keepalive 2

# With configuration file
gunicorn -c gunicorn.conf.py simple_server:app
```

#### Gunicorn Configuration (gunicorn.conf.py)
```python
# gunicorn.conf.py
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 120
keepalive = 2
preload_app = True

# Logging
accesslog = "./logs/access.log"
errorlog = "./logs/error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'
```

### 3. Redis Setup

#### Docker Redis
```bash
# Run Redis in Docker
docker run -d --name redis-chatbot -p 6379:6379 redis:alpine

# With persistence
docker run -d --name redis-chatbot -p 6379:6379 -v redis_data:/data redis:alpine redis-server --appendonly yes
```

#### Redis Configuration for Production
```bash
# /etc/redis/redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 4. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/chatbot
server {
    listen 80;
    server_name your-domain.com;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=chatbot:10m rate=10r/s;
    limit_req zone=chatbot burst=20 nodelay;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for streaming
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # Static files (if any)
    location /static {
        alias /path/to/static/files;
        expires 30d;
    }
}
```

### 5. Docker Deployment

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create logs directory
RUN mkdir -p logs

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["gunicorn", "-c", "gunicorn.conf.py", "simple_server:app"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  chatbot:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - USE_REDIS=true
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - chatbot
    restart: unless-stopped

volumes:
  redis_data:
```

### 6. Monitoring & Logging

#### Prometheus Metrics (optional)
```python
# Add to simple_server.py
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

REQUEST_COUNT = Counter('chatbot_requests_total', 'Total requests', ['endpoint', 'method'])
REQUEST_DURATION = Histogram('chatbot_request_duration_seconds', 'Request duration')
GEMINI_API_CALLS = Counter('gemini_api_calls_total', 'Gemini API calls', ['status'])

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

#### Log Configuration
```python
# Enhanced logging setup
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
        "json": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter"
        }
    },
    "handlers": {
        "default": {
            "level": "INFO",
            "formatter": "standard",
            "class": "logging.StreamHandler",
        },
        "file": {
            "level": "INFO", 
            "formatter": "json",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/chatbot.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "": {
            "handlers": ["default", "file"],
            "level": "INFO",
            "propagate": False
        }
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

### 7. Security Considerations

#### API Key Security
```python
# Environment-based API key validation
def verify_api_key(request: Request) -> bool:
    api_key = request.headers.get("X-API-Key")
    expected_key = os.getenv("API_SECRET_KEY")
    
    if not expected_key or expected_key == "your-secret-api-key":
        logger.warning("API_SECRET_KEY not properly configured")
        return False
    
    return api_key == expected_key
```

#### Rate Limiting Per User
```python
# Enhanced rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

def get_user_id(request: Request):
    # Extract user ID from request for per-user rate limiting
    return request.json().get("user_id", get_remote_address(request))

limiter = Limiter(key_func=get_user_id)

@app.post("/api/v1/chat")
@limiter.limit("50/minute")  # 50 requests per minute per user
async def chat(...):
    # ...
```

### 8. Cost Control & Monitoring

#### Request Quotas
```python
# Add quota tracking per user
DAILY_QUOTAS = defaultdict(lambda: {"requests": 0, "tokens": 0, "date": datetime.utcnow().date()})

async def check_user_quota(user_id: str) -> bool:
    today = datetime.utcnow().date()
    quota = DAILY_QUOTAS[user_id]
    
    if quota["date"] != today:
        # Reset daily quota
        quota["requests"] = 0
        quota["tokens"] = 0
        quota["date"] = today
    
    max_daily_requests = int(os.getenv("MAX_DAILY_REQUESTS", "100"))
    max_daily_tokens = int(os.getenv("MAX_DAILY_TOKENS", "50000"))
    
    return quota["requests"] < max_daily_requests and quota["tokens"] < max_daily_tokens
```

#### Cost Monitoring
```python
# Track costs (rough estimation)
GEMINI_COST_PER_1K_TOKENS = 0.00075  # Example pricing

def estimate_cost(input_tokens: int, output_tokens: int) -> float:
    total_tokens = input_tokens + output_tokens
    return (total_tokens / 1000) * GEMINI_COST_PER_1K_TOKENS

# Add to chat endpoint
cost = estimate_cost(input_tokens, output_tokens)
logger.info(f"Request cost: ${cost:.6f} for user {user_id}")
```

### 9. Troubleshooting Checklist

#### Common Issues
- ✅ **Gemini API Key**: Verify key is set correctly and has proper permissions
- ✅ **Redis Connection**: Check Redis server is running and accessible
- ✅ **Rate Limits**: Monitor rate limiting logs and adjust limits
- ✅ **Memory Usage**: Monitor conversation storage and implement cleanup
- ✅ **Token Limits**: Ensure conversation trimming is working properly

#### Debug Commands
```bash
# Check API health
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "Hello"}'

# Check Redis connection
redis-cli ping

# Monitor logs
tail -f logs/chatbot.log

# Check process status
ps aux | grep gunicorn
ps aux | grep uvicorn
```

#### Performance Optimization
1. **Connection Pooling**: Use Redis connection pools
2. **Async Operations**: Ensure all I/O operations are async
3. **Caching**: Implement aggressive caching for repeated queries
4. **Load Balancing**: Use multiple workers/instances
5. **Database Optimization**: Index frequently queried fields

---

## 🔧 Curl Examples

### Basic Chat Request
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "message": "Explain Python decorators"
  }'
```

### Chat with Session ID
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123", 
    "message": "Can you give me more examples?",
    "session_id": "abc123def456"
  }'
```

### Streaming Chat Request
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "message": "Tell me about machine learning",
    "stream": true
  }'
```

### Get Conversation History (Admin)
```bash
curl -X GET http://localhost:8000/api/v1/conversation/user_123/abc123def456 \
  -H "X-API-Key: your-secret-api-key"
```

### Clear Conversation (Admin)
```bash
curl -X DELETE http://localhost:8000/api/v1/conversation/user_123/abc123def456 \
  -H "X-API-Key: your-secret-api-key"
```

### Health Check
```bash
curl http://localhost:8000/health
```

---

## 📊 Model Configuration Options

### Supported Gemini Models
- `gemini-1.5-flash` (Default) - Fastest, lowest cost
- `gemini-1.5-pro` - Higher quality, slower 
- `gemini-pro` - Legacy model

### Generation Parameters
```python
generation_config=genai.types.GenerationConfig(
    temperature=0.7,      # Creativity (0.0-1.0)
    top_p=0.8,           # Nucleus sampling
    top_k=10,            # Top-K sampling  
    max_output_tokens=1024,  # Response length
    candidate_count=1,    # Number of responses
)
```

To change models, update the `GEMINI_MODEL_NAME` environment variable.
