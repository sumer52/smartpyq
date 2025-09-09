import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import Features from '../components/Features';
import BrowseByStream from '../components/BrowseByStream';
import Testimonials from '../components/Testimonials';
import Statistics from '../components/Statistics';
import QuickActions from '../components/QuickActions';
import PaperCard from '../components/PaperCard';
import { apiClient } from '../lib/api';

const HomePage = () => {
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalDownloads: 0,
    activeUsers: 0,

  });

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load featured papers
        const papersResponse = await apiClient.searchPapers({
          featured: true,
          limit: 6
        });
        
        setFeaturedPapers(papersResponse.papers || []);
        
        // Mock stats - TODO: Replace with actual API call
        setStats({
          totalPapers: 15420,
          totalDownloads: 89650,
          activeUsers: 12340,
          universities: 450
        });
        
      } catch (error) {
        console.error('Failed to load homepage data:', error);
        setError('Failed to load content. Please try again.');
        
        // Fallback to mock data
        setFeaturedPapers([
          {
            id: 1,
            title: 'Data Structures and Algorithms - Final Exam 2023',
            subject: 'Computer Science',
            stream: 'Engineering',
            year: 2023,
            semester: 'Semester 6',
            university: 'Delhi University',
            difficulty: 'Medium',
            tags: ['algorithms', 'data-structures', 'programming'],
            uploadedAt: '2024-01-15T10:30:00Z',
            downloadCount: 1250,
            rating: 4.8,
            fileSize: '2.4 MB',
            pages: 12
          },
          {
            id: 2,
            title: 'Organic Chemistry - Mid-term Examination',
            subject: 'Chemistry',
            stream: 'Science',
            year: 2023,
            semester: 'Semester 4',
            university: 'Mumbai University',
            difficulty: 'Hard',
            tags: ['organic-chemistry', 'reactions', 'mechanisms'],
            uploadedAt: '2024-01-10T14:20:00Z',
            downloadCount: 890,
            rating: 4.6,
            fileSize: '1.8 MB',
            pages: 8
          },
          {
            id: 3,
            title: 'Financial Accounting - Annual Exam 2023',
            subject: 'Accounting',
            stream: 'Commerce',
            year: 2023,
            semester: 'Semester 2',
            university: 'Calcutta University',
            difficulty: 'Easy',
            tags: ['accounting', 'finance', 'balance-sheet'],
            uploadedAt: '2024-01-08T09:15:00Z',
            downloadCount: 2100,
            rating: 4.9,
            fileSize: '3.1 MB',
            pages: 16
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  const handleSearch = (query, filters) => {
    // Navigate to browse page with search parameters
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (filters.subject) searchParams.set('subject', filters.subject);
    if (filters.stream) searchParams.set('stream', filters.stream);
    if (filters.year) searchParams.set('year', filters.year);
    
    window.location.href = `/browse?${searchParams.toString()}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section variants={sectionVariants}>
        <Hero stats={stats} />
      </motion.section>

      {/* Search Section */}
      <motion.section 
        className="py-12 bg-white"
        variants={sectionVariants}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Study Material
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search through thousands of previous year question papers from top universities
            </p>
          </div>
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for papers, subjects, universities..."
            showFilters={true}
            className="max-w-3xl mx-auto"
          />
        </div>
      </motion.section>

      {/* Enhanced Features Section */}
      <motion.section variants={sectionVariants}>
        <Features />
      </motion.section>

      {/* Browse by Stream Section */}
      <motion.section variants={sectionVariants}>
        <BrowseByStream />
      </motion.section>

      {/* Quick Actions */}
      <motion.section 
        className="py-12 bg-white"
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuickActions />
        </div>
      </motion.section>

      {/* Featured Papers */}
      <motion.section 
        className="py-16 bg-gray-50"
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span role="img" aria-label="star">⭐</span> Featured Papers
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Handpicked question papers that are most helpful for exam preparation
            </motion.p>
          </div>

          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-red-700 hover:text-red-800 underline focus:outline-none"
              >
                Try again
              </button>
            </motion.div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Skeleton loader */}
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex space-x-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {featuredPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <PaperCard 
                    paper={paper} 
                    layout="full"
                    showActions={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Papers CTA */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.a
              href="/browse"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-accent-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span role="img" aria-label="search" className="mr-2">🔍</span>
              Browse All Papers
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section variants={sectionVariants}>
        <Testimonials />
      </motion.section>

      {/* Enhanced Statistics Section */}
      <motion.section variants={sectionVariants}>
        <Statistics />
      </motion.section>

      {/* Enhanced Call to Action */}
      <motion.section 
        className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
        variants={sectionVariants}
      >
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Start Your Exam Preparation?
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of successful students who have transformed their academic journey with SmartPYQ. 
            Access premium study materials, AI-powered insights, and comprehensive exam preparation tools.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.a
              href="/browse"
              className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full text-lg shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 10px 30px rgba(147, 51, 234, 0.3)',
                  '0 15px 40px rgba(147, 51, 234, 0.4)',
                  '0 10px 30px rgba(147, 51, 234, 0.3)'
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }}
            >
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 animate-pulse" />
              
              <span className="relative z-10 flex items-center">
                <span className="mr-3 text-2xl">🚀</span>
                Create Free Account
              </span>
            </motion.a>
            
            <motion.a
              href="/browse"
              className="group relative inline-flex items-center px-10 py-5 bg-white border-3 border-purple-600 text-purple-600 font-bold rounded-full text-lg shadow-lg hover:shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                borderColor: [
                  'rgb(147, 51, 234)',
                  'rgb(59, 130, 246)',
                  'rgb(147, 51, 234)'
                ]
              }}
              transition={{
                borderColor: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }}
            >
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="relative z-10 flex items-center">
                <span className="mr-3 text-2xl">📚</span>
                Browse Papers
              </span>
            </motion.a>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="font-medium">Free to Start</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="font-medium">Instant Access</span>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;