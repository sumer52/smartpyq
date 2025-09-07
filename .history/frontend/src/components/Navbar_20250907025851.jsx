import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Bot, 
  Upload, 
  BarChart3, 
  Library,
  Lock
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleNavigation = (path, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
    setIsProfileDropdownOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Navigation items for visitors
  const visitorNavItems = [
    { name: 'Home', path: '/home', icon: BookOpen },
    { name: 'Browse Papers', path: '/browse', icon: BookOpen, subtitle: 'Limited access' },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, locked: true },
    { name: 'Upload Paper', path: '/upload', icon: Upload, locked: true },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, locked: true },
  ];

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    { name: 'Home', path: '/home', icon: BookOpen },
    { name: 'Browse Papers', path: '/browse', icon: BookOpen },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Upload Paper', path: '/upload', icon: Upload },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'My Library', path: '/library', icon: Library },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : visitorNavItems;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/home')}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SmartPYQ</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation(item.path, item.locked)}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : item.locked
                      ? 'text-gray-400 hover:text-gray-500'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.locked && <Lock className="w-3 h-3" />}
                  {item.subtitle && (
                    <span className="text-xs text-gray-400 ml-1">({item.subtitle})</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Side - Auth Buttons or Profile */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              /* Profile Dropdown */
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || 'Student'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </motion.button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login/Signup Buttons */
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Login
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="btn-primary"
                >
                  Sign Up
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleNavigation(item.path, item.locked)}
                    className={`w-full px-3 py-2 rounded-lg text-left font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : item.locked
                        ? 'text-gray-400'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.locked && <Lock className="w-3 h-3" />}
                    {item.subtitle && (
                      <span className="text-xs text-gray-400 ml-1">({item.subtitle})</span>
                    )}
                  </motion.button>
                );
              })}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="w-full btn-outline text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigation('/signup')}
                    className="w-full btn-primary text-center"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(isProfileDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;