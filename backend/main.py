from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Import your existing engine
from ordinai_core import OrdinAIEngine

app = FastAPI(title="OrdinAI API")

# --- CORS SETUP ---
# Development: Allow localhost:3000 (React) and localhost:8000 (FastAPI docs)
# For production, replace with specific domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INITIALIZE ENGINE ---
# Instantiate it once when the server starts
try:
    engine = OrdinAIEngine()
    print("✅ OrdinAI Engine Initialized successfully!")
except Exception as e:
    print(f"❌ Failed to initialize engine: {e}")
    engine = None

# --- API MODELS ---
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    sources: dict

# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"status": "OrdinAI API is running!"}

@app.post("/api/generate", response_model=QueryResponse)
def generate_report(request: QueryRequest):
    if not engine:
        raise HTTPException(status_code=500, detail="AI Engine not initialized.")
    
    try:
        # Call your existing function!
        answer, used_context = engine.generate_answer(request.query)
        
        # Return structured data for the frontend
        return {
            "answer": answer,
            "sources": used_context
        }
    except Exception as e:
        # Log the actual error for debugging
        print(f"API Error: {e}")
        # Return a user-friendly error instead of exposing stack traces
        raise HTTPException(status_code=500, detail="An error occurred while generating the report. Please check your API keys and try again.")
