#!/usr/bin/env python3
"""Direct test of Gemini API."""

import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini_direct():
    # Load environment
    load_dotenv()
    
    # Get API key
    api_key = os.getenv('GEMINI_API_KEY')
    
    # Fallback to known key if env loading fails
    if not api_key or len(api_key) < 20:
        api_key = "AIzaSyArfBwsHX6w6uXC5zpaQ5vTtFO8KinpIqI"
        print("Using fallback API key")
    else:
        print("Using API key from environment")
    
    print(f"API Key: {api_key[:10]}...")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test question
        response = model.generate_content(
            "What is Python programming language? Give a brief answer.",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=200,
            )
        )
        
        print("✅ SUCCESS!")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_gemini_direct()
