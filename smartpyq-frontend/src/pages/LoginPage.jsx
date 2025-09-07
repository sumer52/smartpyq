import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({ general: result.error });
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Additional floating elements */}
        <div className="absolute top-32 right-32 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-lg animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-32 w-16 h-16 bg-gradient-to-r from-pink-400/20 to-rose-500/20 rounded-full mix-blend-multiply filter blur-lg animate-bounce" style={{ animationDelay: '1.5s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <motion.div
        className="relative z-10 max-w-md w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <Link to="/" className="inline-block">
            <motion.h1 
              className="text-4xl font-bold mb-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                📚 SmartPYQ
              </span>
            </motion.h1>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-200">Sign in to access your study materials and continue learning 🎓</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8"
          variants={itemVariants}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Demo Credentials Info */}
            <motion.div 
              className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm"
              variants={itemVariants}
            >
              <div className="flex items-start space-x-3">
                <div className="text-blue-300 text-xl">💡</div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-200 mb-1">Demo Credentials</h4>
                  <p className="text-xs text-blue-300 mb-2">Use these credentials to test the login:</p>
                  <div className="text-xs text-blue-200 space-y-1">
                    <div><strong>Email:</strong> demo@smartpyq.com</div>
                    <div><strong>Password:</strong> demo123</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* General Error */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-center space-x-3 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ExclamationCircleIcon className="h-5 w-5 text-red-300" />
                  <span className="text-red-200 text-sm">{errors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-400/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="mt-2 text-sm text-red-300 flex items-center space-x-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{errors.email}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-12 py-3 bg-white/10 border backdrop-blur-sm rounded-xl shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-400/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="mt-2 text-sm text-red-300 flex items-center space-x-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{errors.password}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Remember Me */}
            <motion.div className="flex items-center justify-between" variants={itemVariants}>
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                  Remember me
                </label>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg backdrop-blur-sm"
                whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Sign In</span>
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign up here 📝
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;