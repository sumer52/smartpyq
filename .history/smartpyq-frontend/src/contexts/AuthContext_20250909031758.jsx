import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock user data for demonstration
  const mockUser = {
    id: 1,
    name: 'sumer',
    email: 'su@university.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Student',
    course: 'B.Sc Computer Science',
    year: '3rd Year',
    semester: 'Semester 5',
    joinedDate: '2022-08-15',
    stats: {
      papersDownloaded: 47,
      studyStreak: 12,
      favoriteSubjects: ['Data Structures', 'Algorithms', 'Database Systems'],
      recentActivity: [
        { action: 'Downloaded', item: 'Data Structures - 2023 Paper', time: '2 hours ago' },
        { action: 'Saved', item: 'Algorithms - 2022 Paper', time: '1 day ago' },
        { action: 'Viewed', item: 'Database Systems - 2021 Paper', time: '2 days ago' }
      ]
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (email === 'demo@smartpyq.com' && password === 'demo123') {
        const token = 'mock-jwt-token-' + Date.now();
        const userData = { ...mockUser, email };
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        return { success: true, user: userData };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = 'mock-jwt-token-' + Date.now();
      const newUser = {
        ...mockUser,
        name: userData.name,
        email: userData.email,
        course: userData.course || 'B.Sc Computer Science',
        stats: {
          ...mockUser.stats,
          papersDownloaded: 0,
          studyStreak: 0,
          recentActivity: []
        }
      };
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return { success: true, user: newUser };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      return { success: true, message: 'Password reset link sent to your email' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Failed to send reset link' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;