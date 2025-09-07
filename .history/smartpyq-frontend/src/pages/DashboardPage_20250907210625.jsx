import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  BookOpenIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HeartIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'New PYQ papers added for Data Structures!', time: '2 hours ago', unread: true },
    { id: 2, type: 'info', message: 'Your study streak is now 12 days! 🔥', time: '1 day ago', unread: true },
    { id: 3, type: 'warning', message: 'Exam reminder: Database Systems - Next week', time: '2 days ago', unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const quickActions = [
    {
      title: 'Browse PYQs',
      description: 'Find papers by stream and year',
      icon: BookOpenIcon,
      color: 'from-blue-500 to-indigo-600',
      href: '/pyq',
      emoji: '📚'
    },
    {
      title: 'Upload Paper',
      description: 'Share your question papers',
      icon: CloudArrowUpIcon,
      color: 'from-green-500 to-emerald-600',
      href: '/upload',
      emoji: '📤'
    },
    {
      title: 'AI Assistant',
      description: 'Get study recommendations',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-purple-500 to-pink-600',
      href: '/chat',
      emoji: '🤖'
    },
    {
      title: 'Browse All',
      description: 'Explore all available papers',
      icon: MagnifyingGlassIcon,
      color: 'from-orange-500 to-red-600',
      href: '/browse',
      emoji: '🔍'
    }
  ];

  const recentActivity = user?.stats?.recentActivity || [];
  const favoriteSubjects = user?.stats?.favoriteSubjects || [];

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <motion.header 
        className="bg-white shadow-lg border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                className="text-2xl font-bold"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  📚 SmartPYQ
                </span>
              </motion.div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Search papers, subjects, or topics..."
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              notification.unread ? 'bg-blue-50' : ''
                            }`}
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.avatar}
                  alt={user?.name}
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.course}</p>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">🎓</div>
                <div className="absolute bottom-4 left-4 text-4xl">📚</div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">🚀</div>
              </div>
              
              <div className="relative z-10">
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </motion.h1>
                <motion.p 
                  className="text-xl opacity-90 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Ready to ace your {user?.course} exams? Let's continue your learning journey!
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap gap-6 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="h-5 w-5" />
                    <span>{user?.stats?.papersDownloaded || 0} Papers Downloaded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FireIcon className="h-5 w-5" />
                    <span>{user?.stats?.studyStreak || 0} Day Study Streak</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-5 w-5" />
                    <span>{user?.year} • {user?.semester}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">⚡</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group"
                  >
                    <Link to={action.href}>
                      <div className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}>
                        {/* Background Pattern */}
                        <div className="absolute top-2 right-2 text-3xl opacity-20">
                          {action.emoji}
                        </div>
                        
                        <div className="relative z-10">
                          <IconComponent className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform" />
                          <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                          <p className="text-sm opacity-90">{action.description}</p>
                        </div>
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Stats and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <ClockIcon className="h-6 w-6 mr-3 text-indigo-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {activity.action[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          <span className="text-indigo-600">{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity yet. Start exploring PYQs!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Favorite Subjects */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <HeartIcon className="h-6 w-6 mr-3 text-red-500" />
                  Favorite Subjects
                </h3>
                <div className="space-y-3">
                  {favoriteSubjects.length > 0 ? favoriteSubjects.map((subject, index) => (
                    <motion.div
                      key={subject}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                          <StarIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{subject}</span>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-6 text-gray-500">
                      <StarIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No favorites yet</p>
                    </div>
                  )}
                </div>
                
                <motion.button
                  className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Subject</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;