import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@heroicons/react/24/solid';

const ChatWidget = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m your AI study assistant. I can help you with questions about previous year papers, study tips, and academic guidance. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const eventSourceRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Handle unread count
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${sessionId}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [sessionId]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Mock typing animation
  const showTypingAnimation = () => {
    setIsTyping(true);
    // Simulate variable typing delay
    const typingDelay = Math.random() * 2000 + 1000; // 1-3 seconds
    setTimeout(() => {
      setIsTyping(false);
    }, typingDelay);
  };

  // Handle SSE connection for streaming responses
  const handleSSEResponse = (userMessage) => {
    // TODO: Replace with actual SSE endpoint
    const sseUrl = `${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/chat/stream?session_id=${sessionId}`;
    
    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;
      
      let botMessageId = Date.now();
      let accumulatedContent = '';
      
      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setError(null);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'content') {
            accumulatedContent += data.content;
            
            setMessages(prev => {
              const existing = prev.find(msg => msg.id === botMessageId);
              if (existing) {
                return prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                );
              } else {
                return [...prev, {
                  id: botMessageId,
                  type: 'bot',
                  content: accumulatedContent,
                  timestamp: new Date(),
                  streaming: true
                }];
              }
            });
          } else if (data.type === 'done') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, streaming: false }
                  : msg
              )
            );
            setIsLoading(false);
            eventSource.close();
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        // Fallback to regular fetch
        handleFallbackResponse(userMessage);
      };
      
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      handleFallbackResponse(userMessage);
    }
  };

  // Fallback to regular fetch if SSE fails
  const handleFallbackResponse = async (userMessage) => {
    try {
      showTypingAnimation();
      
      // TODO: Replace with actual API endpoint
      const response = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          context: messages.slice(-5) // Send last 5 messages for context
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Wait for typing animation to complete
      setTimeout(() => {
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: data.response || 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }, Math.max(0, 1000 - (Date.now() % 1000))); // Ensure minimum typing time
      
    } catch (error) {
      console.error('Chat API error:', error);
      setError('Failed to send message. Please try again.');
      setIsLoading(false);
      setIsTyping(false);
      
      // Mock response for demo
      setTimeout(() => {
        const mockResponses = [
          "I'd be happy to help you with that! Could you provide more specific details about what you're looking for?",
          "That's a great question! Based on previous year papers, I can suggest some key topics to focus on.",
          "I can help you find relevant study materials and previous year questions for that topic.",
          "Let me break that down for you with some examples from past examinations.",
          "Here are some important points to remember for your exam preparation."
        ];
        
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        const botMessage = {
          id: Date.now(),
          type: 'bot',
          content: randomResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setError(null);
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }, 1500);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    // Try SSE first, fallback to regular fetch
    if (typeof EventSource !== 'undefined') {
      handleSSEResponse(userMessage.content);
    } else {
      handleFallbackResponse(userMessage.content);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Chat cleared! How can I help you today?',
        timestamp: new Date()
      }
    ]);
    localStorage.removeItem(`chat_${sessionId}`);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const TypingIndicator = () => (
    <motion.div
      className="flex items-center space-x-1 px-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={
              {
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }
            }
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-2">AI is typing...</span>
    </motion.div>
  );

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ width: '384px', maxHeight: '600px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Study Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  className="text-white/80 hover:text-white p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                  onClick={toggleMinimize}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                >
                  <MinusIcon className="h-4 w-4" />
                </motion.button>
                <motion.button
                  className="text-white/80 hover:text-white p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                  onClick={toggleChat}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close chat"
                >
                  <XMarkIcon className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Messages */}
                  <div 
                    ref={chatContainerRef}
                    className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${message.type === 'user'
                              ? 'bg-brand-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.streaming && (
                              <motion.div
                                className="inline-block w-2 h-4 bg-current ml-1"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                            )}
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                            {formatTime(new Date(message.timestamp))}
                          </p>
                        </div>
                        {message.type === 'bot' && (
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center mr-2 mt-1 order-0">
                            <SparklesIcon className="h-4 w-4 text-brand-600" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {/* Typing indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center mr-2">
                            <SparklesIcon className="h-4 w-4 text-brand-600" />
                          </div>
                          <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                            <TypingIndicator />
                          </div>
                        </div>
                      )}
                    </AnimatePresence>
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="px-4 py-2 bg-red-50 border-t border-red-100"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-center text-red-600 text-sm">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                          {error}
                          <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700 focus:outline-none"
                            aria-label="Dismiss error"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about studies..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-colors"
                          rows={1}
                          style={{ minHeight: '40px', maxHeight: '120px' }}
                          disabled={isLoading}
                        />
                      </div>
                      <motion.button
                        className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                          inputValue.trim() && !isLoading
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        whileHover={{ scale: inputValue.trim() && !isLoading ? 1.05 : 1 }}
                        whileTap={{ scale: inputValue.trim() && !isLoading ? 0.95 : 1 }}
                        aria-label="Send message"
                      >
                        {isLoading ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        ) : (
                          <PaperAirplaneIcon className="h-5 w-5" />
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {messages.length <= 1 && (
                        <>
                          <button
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                            onClick={() => setInputValue('Help me find previous year papers for computer science')}
                          >
                            Find Papers
                          </button>
                          <button
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                            onClick={() => setInputValue('What are some good study tips for exams?')}
                          >
                            Study Tips
                          </button>
                          <button
                            className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                            onClick={() => setInputValue('Explain this topic to me')}
                          >
                            Explain Topic
                          </button>
                        </>
                      )}
                      {messages.length > 2 && (
                        <button
                          className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          onClick={clearChat}
                        >
                          Clear Chat
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.button
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/30 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800'
        }`}
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <ChatBubbleLeftRightIconSolid className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;