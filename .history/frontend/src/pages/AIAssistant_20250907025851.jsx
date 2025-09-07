import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageCircle, 
  Trash2, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Zap
} from 'lucide-react';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${user?.name || 'there'}! 👋 I'm your AI study assistant powered by Gemini. I can help you with:\n\n• Understanding question paper patterns\n• Explaining complex topics\n• Study tips and strategies\n• Previous year question analysis\n• Subject-specific guidance\n\nWhat would you like to know today?`,
      timestamp: new Date(),
      suggestions: [
        'Explain data structures concepts',
        'How to prepare for algorithms exam?',
        'Show me OS question patterns',
        'Tips for database management'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    {
      icon: BookOpen,
      title: 'Study Tips',
      prompt: 'Give me effective study tips for computer science subjects'
    },
    {
      icon: Lightbulb,
      title: 'Concept Explanation',
      prompt: 'Explain the concept of time complexity in algorithms'
    },
    {
      icon: HelpCircle,
      title: 'Exam Strategy',
      prompt: 'How should I prepare for my final exams in the last month?'
    },
    {
      icon: Zap,
      title: 'Quick Review',
      prompt: 'Give me a quick review of important database concepts'
    }
  ];

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateAIResponse(messageText),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userMessage) => {
    const responses = {
      'data structures': `Great question about data structures! Here's a comprehensive overview:\n\n**Key Data Structures:**\n• Arrays - Fixed size, O(1) access\n• Linked Lists - Dynamic size, O(n) search\n• Stacks - LIFO principle, O(1) operations\n• Queues - FIFO principle, O(1) operations\n• Trees - Hierarchical structure, O(log n) operations\n• Graphs - Network of nodes and edges\n\n**Study Tips:**\n1. Practice implementation in your preferred language\n2. Understand time and space complexity\n3. Solve problems on platforms like LeetCode\n4. Draw diagrams to visualize operations\n\nWould you like me to explain any specific data structure in detail?`,
      
      'algorithms': `Algorithms are step-by-step procedures for solving problems! Here's what you should focus on:\n\n**Important Algorithm Categories:**\n• Sorting (Quick, Merge, Heap sort)\n• Searching (Binary search, DFS, BFS)\n• Dynamic Programming\n• Greedy Algorithms\n• Graph Algorithms\n\n**Preparation Strategy:**\n1. Master the fundamentals first\n2. Practice coding implementations\n3. Analyze time/space complexity\n4. Solve previous year questions\n5. Use visualization tools\n\n**Pro Tip:** Start with simple algorithms and gradually move to complex ones. Understanding the logic is more important than memorizing code!`,
      
      'database': `Database Management Systems are crucial! Here's your study guide:\n\n**Core Concepts:**\n• Relational Model & ER Diagrams\n• Normalization (1NF, 2NF, 3NF, BCNF)\n• SQL Queries & Joins\n• Transactions & ACID Properties\n• Indexing & Query Optimization\n\n**Common Exam Topics:**\n• Design ER diagrams\n• Write complex SQL queries\n• Normalize database schemas\n• Explain transaction concepts\n• Compare different database models\n\n**Study Approach:**\n1. Practice SQL on real databases\n2. Draw ER diagrams for real scenarios\n3. Understand normalization with examples\n4. Learn transaction isolation levels\n\nNeed help with any specific database topic?`,
      
      'operating system': `Operating Systems concepts are fundamental! Here's your roadmap:\n\n**Key Areas:**\n• Process Management & Scheduling\n• Memory Management & Virtual Memory\n• File Systems & I/O Management\n• Synchronization & Deadlocks\n• Security & Protection\n\n**Important Algorithms:**\n• CPU Scheduling (FCFS, SJF, Round Robin)\n• Page Replacement (FIFO, LRU, Optimal)\n• Disk Scheduling (FCFS, SSTF, SCAN)\n• Deadlock Prevention & Detection\n\n**Exam Preparation:**\n1. Understand process states and transitions\n2. Practice scheduling algorithm calculations\n3. Learn memory allocation techniques\n4. Study synchronization problems\n\nWhich OS topic would you like me to explain in detail?`
    };

    // Simple keyword matching for demo
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Default response
    return `I understand you're asking about "${userMessage}". While I'd love to provide a detailed answer, let me give you some general guidance:\n\n**Study Approach:**\n1. Break down complex topics into smaller parts\n2. Use multiple resources (textbooks, videos, practice)\n3. Create mind maps and summaries\n4. Practice with previous year questions\n5. Form study groups for discussion\n\n**Quick Tips:**\n• Review concepts regularly\n• Focus on understanding over memorization\n• Practice coding if it's a programming subject\n• Take breaks to avoid burnout\n\nCould you be more specific about what you'd like to learn? I can provide more targeted help!`;
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Chat cleared! I'm here to help you with your studies. What would you like to know?`,
        timestamp: new Date()
      }
    ]);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }`}>
            {message.type === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
        </div>
        
        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          message.type === 'user'
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          
          {/* Suggestions */}
          {message.suggestions && (
            <div className="mt-3 space-y-2">
              {message.suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Message Actions */}
          {message.type === 'bot' && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyMessage(message.content)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors duration-200"
                  title="Helpful"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
              
              <span className="text-xs text-gray-400">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <div className="flex space-x-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Study Assistant</h1>
                <p className="text-gray-600">Powered by Gemini • Always here to help</p>
              </div>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-6 lg:px-8 py-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage(prompt.prompt)}
                  className="p-4 bg-white border border-gray-200 hover:border-primary-300 rounded-xl text-left transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 group-hover:bg-primary-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <prompt.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{prompt.prompt}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white border-t px-4 sm:px-6 lg:px-8 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex space-x-4"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                disabled={isTyping}
              />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              whileHover={{ scale: inputMessage.trim() && !isTyping ? 1.05 : 1 }}
              whileTap={{ scale: inputMessage.trim() && !isTyping ? 0.95 : 1 }}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </motion.button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are generated for educational purposes. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;