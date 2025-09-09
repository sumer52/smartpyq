#!/usr/bin/env python3
"""
Simple test script to verify Gemini API integration.
"""

import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test Gemini API with the configured API key."""
    
    # Get API key from environment
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment variables")
        return False
    
    print(f"✅ Found Gemini API key: {api_key}")
    print(f"   Key length: {len(api_key)} characters")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create model
        model = genai.GenerativeModel('gemini-pro')
        
        print("🤖 Testing Gemini API...")
        
        # Test prompt
        prompt = "Hello! Can you help students with their academic questions? Please respond briefly."
        
        # Generate response
        response = model.generate_content(prompt)
        
        print("\n🎉 Gemini API Response:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        print("\n✅ Gemini API integration is working successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing Gemini API: {e}")
        return False

def test_environment_config():
    """Test environment configuration."""
    
    print("🔧 Testing Environment Configuration:")
    print("-" * 40)
    
    # Check .env file
    if os.path.exists('.env'):
        print("✅ .env file exists")
    else:
        print("❌ .env file not found")
    
    # Check key environment variables
    env_vars = [
        'GEMINI_API_KEY',
        'ENV',
        'DEBUG',
        'DATABASE_URL'
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            if 'API_KEY' in var or 'PASSWORD' in var:
                print(f"✅ {var}: {value[:10]}...{value[-4:]}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
    
    print("-" * 40)

if __name__ == "__main__":
    print("🚀 Smart PYQ - Gemini API Integration Test")
    print("=" * 50)
    
    # Test environment configuration
    test_environment_config()
    
    print("\n")
    
    # Test Gemini API
    success = test_gemini_api()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Your Smart PYQ chatbot is ready to use.")
    else:
        print("❌ Tests failed. Please check your configuration.")
    print("=" * 50)