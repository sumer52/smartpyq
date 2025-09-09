from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    success: bool

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    return ChatResponse(
        response=f"You asked: {request.message}. This is a test response!",
        success=True
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
