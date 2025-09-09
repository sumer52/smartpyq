import requests
import json

# Test various questions
questions = [
    "hello",
    "help", 
    "what is machine learning",
    "explain algorithms",
    "what are data structures",
    "tell me about databases",
    "how to study effectively",
    "what is java",
    "explain functions in programming"
]

print("Testing chatbot responses:")
print("=" * 50)

for question in questions:
    try:
        response = requests.post('http://localhost:8080/api/v1/chat', json={'message': question})
        if response.status_code == 200:
            data = response.json()
            print(f"Q: {question}")
            print(f"A: {data['response']}")
            print("-" * 40)
        else:
            print(f"Error for '{question}': Status {response.status_code}")
            break
    except Exception as e:
        print(f"Failed for '{question}': {e}")
        break
