import React from 'react';

// Simple App component for testing

function App() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-6">SmartPYQ</h1>
        <p className="text-2xl text-gray-700 mb-8">Intelligent Previous Year Papers Platform</p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          ✅ React is working perfectly!
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">📚 Browse Papers</h2>
            <p className="text-blue-600">Access thousands of previous year question papers</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">🤖 AI Assistant</h2>
            <p className="text-purple-600">Get help with your studies using AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;