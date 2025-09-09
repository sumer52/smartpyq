import requests

# Test various types of questions like you would ask ChatGPT
test_questions = [
    "what is data?",
    "explain machine learning",
    "how does the internet work?", 
    "what is artificial intelligence?",
    "tell me about databases",
    "how to study effectively",
    "what is computer science?",
    "explain quantum physics",
    "what is blockchain?",
    "how do algorithms work?"
]

print("🤖 Testing New Intelligent Chatbot")
print("=" * 50)

for i, question in enumerate(test_questions, 1):
    try:
        response = requests.post('http://localhost:8000/api/v1/chat', 
                               json={'message': question}, 
                               timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"{i}. Q: {question}")
            print(f"   A: {data['response'][:150]}...")
            print()
        else:
            print(f"Error for '{question}': Status {response.status_code}")
            break
    except Exception as e:
        print(f"Failed for '{question}': {e}")
        break

print("✅ Testing complete!")
