import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  BookOpen, 
  Bot, 
  TrendingUp, 
  Download, 
  Star, 
  Users, 
  FileText, 
  ArrowRight,
  Lock,
  Sparkles
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFeatureClick = (feature, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(feature);
  };

  // Demo data for visitors
  const demoStats = {
    papers: 1250,
    students: 5000,
    subjects: 45
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Previous Year Papers',
      description: isAuthenticated 
        ? 'Access complete database of PYQs across all subjects and years'
        : 'Browse sample papers from various subjects (limited access)',
      action: '/browse',
      locked: false,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Bot,
      title: 'AI Study Assistant',
      description: isAuthenticated
        ? 'Get instant help with questions, explanations, and study guidance'
        : 'AI-powered study assistant to help with your queries',
      action: '/ai-assistant',
      locked: !isAuthenticated,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analysis',
      description: isAuthenticated
        ? 'View trending topics and predicted exam patterns'
        : 'Discover high-frequency topics and exam trends',
      action: '/analytics',
      locked: !isAuthenticated,
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Download,
      title: 'Offline Access',
      description: isAuthenticated
        ? 'Download PDFs for offline study with watermark protection'
        : 'Download papers for offline access',
      action: '/browse',
      locked: !isAuthenticated,
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative rainbow-gradient text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6 floating pulse-rainbow"
              style={{
                textShadow: '0 0 20px rgba(255, 107, 107, 0.8), 0 0 40px rgba(78, 205, 196, 0.6)'
              }}
            >
              {isAuthenticated ? (
                <>Welcome back, <span className="text-yellow-300">{user?.name?.split(' ')[0] || 'Student'}</span> 👋</>
              ) : (
                <>Access <span className="text-yellow-300">Previous Year Papers</span></>
              )}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-blue-100"
            >
              {isAuthenticated 
                ? 'Your personalized study companion with AI assistance'
                : 'Smart platform for students to access PYQs with AI assistance'
              }
            </motion.p>
            
            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAuthenticated 
                    ? "Search papers, subjects, or topics..." 
                    : "Try searching 'Mathematics' or 'Physics'..."
                  }
                  className="w-full px-6 py-4 pl-12 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none text-lg border-2 border-transparent transition-all duration-300"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 107, 107, 0.3)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff6b6b';
                    e.target.style.boxShadow = '0 0 25px rgba(255, 107, 107, 0.6), 0 0 40px rgba(78, 205, 196, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.3)';
                  }}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </motion.form>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => handleFeatureClick('/browse')}
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Browse Papers</span>
              </button>
              
              <button
                onClick={() => handleFeatureClick('/ai-assistant', true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 px-8 rounded-full transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Bot className="w-5 h-5" />
                <span>{isAuthenticated ? 'Try AI Assistant' : 'Try AI Assistant'}</span>
                {!isAuthenticated && <Lock className="w-4 h-4" />}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-primary-600 mb-2">{demoStats.papers}+</div>
              <div className="text-gray-600">Question Papers</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-primary-600 mb-2">{demoStats.students}+</div>
              <div className="text-gray-600">Active Students</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-primary-600 mb-2">{demoStats.subjects}+</div>
              <div className="text-gray-600">Subjects Covered</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {isAuthenticated ? 'Your Study Tools' : 'Platform Features'}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600"
            >
              {isAuthenticated 
                ? 'Everything you need for effective exam preparation'
                : 'Discover what SmartPYQ offers to enhance your studies'
              }
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleFeatureClick(feature.action, feature.locked)}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                    {/* Locked Overlay */}
                    {feature.locked && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                        <div className="text-center text-white">
                          <Lock className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Login to unlock</p>
                        </div>
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors duration-200">
                      <span className="mr-2">Explore</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personalized Section (Only for authenticated users) */}
      {isAuthenticated && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <span>Personalized for You</span>
              </motion.h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Recommended PYQs</h3>
                <p className="text-gray-600">Based on your study history and stream</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Recently Viewed</h3>
                <p className="text-gray-600">Quick access to your recent papers</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Suggested Topics</h3>
                <p className="text-gray-600">High-priority topics for your exams</p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;