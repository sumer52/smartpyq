import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const PublicRoute = ({ children, redirectTo = '/home' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading SmartPYQ...</p>
        </motion.div>
      </div>
    );
  }

  // If user is authenticated, redirect to the specified route (usually dashboard/home)
  if (user) {
    // Get the intended destination from location state, or use default redirectTo
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // If user is not authenticated, render the public component (login, signup, etc.)
  return children;
};

export default PublicRoute;