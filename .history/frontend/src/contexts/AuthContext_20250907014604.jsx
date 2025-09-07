import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API base URL - adjust based on your backend
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasEnteredCode, setHasEnteredCode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Demo credentials
  const DEMO_CREDENTIALS = {
    email: 'sson@demo.com',
    password: 'demo123'
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedCodeEntry = localStorage.getItem('hasEnteredCode');
      
      if (storedCodeEntry) {
        setHasEnteredCode(true);
      }
      
      if (storedToken && storedUser) {
        try {
          // Set axios authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token with backend
          const response = await axios.get('/auth/me');
          
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Enter ID/Code function
  const enterCode = (id, code) => {
    // Simple validation - in real app, this would validate against backend
    if (id && code) {
      setHasEnteredCode(true);
      localStorage.setItem('hasEnteredCode', 'true');
      return { success: true };
    }
    return { success: false, error: 'Please enter both ID and code' };
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Check for demo credentials
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Demo user login
        const demoUser = {
          id: 'demo-user-1',
          name: 'Demo Student',
          email: 'sson@demo.com',
          role: 'student',
          verified: true
        };
        
        const demoToken = 'demo-jwt-token-' + Date.now();
        
        setUser(demoUser);
        setToken(demoToken);
        setIsAuthenticated(true);
        
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
        
        return { success: true, user: demoUser };
      }
      
      // Real API login
      const response = await axios.post('/auth/login', {
        email,
        password
      });
      
      const { access_token, user: userData } = response.data;
      
      setUser(userData);
      setToken(access_token);
      setIsAuthenticated(true);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/auth/signup', userData);
      
      return {
        success: true,
        message: 'Account created successfully. Please verify your email.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Signup failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Reset code entry (for testing)
  const resetCodeEntry = () => {
    setHasEnteredCode(false);
    localStorage.removeItem('hasEnteredCode');
  };

  const value = {
    isAuthenticated,
    hasEnteredCode,
    user,
    token,
    loading,
    login,
    signup,
    logout,
    enterCode,
    resetCodeEntry,
    DEMO_CREDENTIALS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};