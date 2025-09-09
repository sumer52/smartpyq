import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UploadStepper from '../components/UploadStepper';
import { apiClient } from '../lib/api';

const UploadPage = () => {
  const [uploadStats, setUploadStats] = useState({
    totalUploads: 1250,
    pendingReview: 45,
    approved: 1180,
    rejected: 25
  });

  const [recentUploads, setRecentUploads] = useState([
    {
      id: 1,
      title: 'Advanced Mathematics - Final Exam 2023',
      status: 'approved',
      uploadedAt: '2024-01-15T10:30:00Z',
      downloads: 234
    },
    {
      id: 2,
      title: 'Organic Chemistry - Mid-term 2023',
      status: 'pending',
      uploadedAt: '2024-01-14T15:20:00Z',
      downloads: 0
    },
    {
      id: 3,
      title: 'Computer Networks - Assignment Questions',
      status: 'approved',
      uploadedAt: '2024-01-12T09:45:00Z',
      downloads: 156
    }
  ]);

  const handleUploadComplete = async (uploadData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Upload completed:', uploadData);
      
      // Mock API response
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            paperId: Date.now(),
            message: 'Paper uploaded successfully and is under review'
          });
        }, 1000);
      });

      // Update recent uploads
      const newUpload = {
        id: response.paperId,
        title: uploadData.title,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        downloads: 0
      };

      setRecentUploads(prev => [newUpload, ...prev.slice(0, 4)]);
      setUploadStats(prev => ({
        ...prev,
        totalUploads: prev.totalUploads + 1,
        pendingReview: prev.pendingReview + 1
      }));

      return response;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📄';
    }
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      className="min-h-screen bg-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <span role="img" aria-label="upload">📤</span> Upload Question Paper
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Share your question papers with fellow students and help build our comprehensive database
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Section */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Upload New Paper
                </h2>
                <UploadStepper onUploadComplete={handleUploadComplete} />
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Upload Guidelines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span role="img" aria-label="guidelines">📋</span> Upload Guidelines
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  Upload clear, readable PDF files only
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  Maximum file size: 10MB
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  Include accurate metadata (subject, year, etc.)
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  Only upload original question papers
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">✗</span>
                  No copyrighted or restricted content
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 mt-0.5">✗</span>
                  No answer keys or solutions
                </li>
              </ul>
            </div>

            {/* Upload Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span role="img" aria-label="stats">📊</span> Your Upload Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Uploads</span>
                  <span className="font-semibold text-gray-900">{uploadStats.totalUploads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">{uploadStats.approved.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Review</span>
                  <span className="font-semibold text-yellow-600">{uploadStats.pendingReview}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-600">{uploadStats.rejected}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Approval Rate</span>
                  <span>{Math.round((uploadStats.approved / uploadStats.totalUploads) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(uploadStats.approved / uploadStats.totalUploads) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <span role="img" aria-label="recent">🕒</span> Recent Uploads
              </h3>
              <div className="space-y-3">
                {recentUploads.map((upload) => (
                  <motion.div
                    key={upload.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 mr-2">
                        {upload.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                        <span role="img" aria-label={upload.status} className="mr-1">
                          {getStatusIcon(upload.status)}
                        </span>
                        {upload.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(upload.uploadedAt).toLocaleDateString()}
                      </span>
                      <span>
                        {upload.downloads} downloads
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.a
                href="/profile/uploads"
                className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium mt-4 focus:outline-none"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View all uploads →
              </motion.a>
            </div>

            {/* Rewards Info */}
            <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">
                <span role="img" aria-label="reward">🎁</span> Upload Rewards
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span role="img" aria-label="points" className="mr-2">⭐</span>
                  <span>Earn 10 points per approved upload</span>
                </div>
                <div className="flex items-center">
                  <span role="img" aria-label="badge" className="mr-2">🏆</span>
                  <span>Unlock contributor badges</span>
                </div>
                <div className="flex items-center">
                  <span role="img" aria-label="special" className="mr-2">🎓</span>
                  <span>Help fellow students succeed</span>
                </div>
              </div>
              <motion.button
                className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <motion.section 
        className="py-16 bg-white"
        variants={itemVariants}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span role="img" aria-label="faq">❓</span> Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about uploading question papers
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "What file formats are supported?",
                answer: "We currently support PDF files only. Make sure your file is clear and readable before uploading."
              },
              {
                question: "How long does the review process take?",
                answer: "Most uploads are reviewed within 24-48 hours. You'll receive an email notification once your paper is approved or if any changes are needed."
              },
              {
                question: "Can I upload answer keys or solutions?",
                answer: "No, we only accept original question papers. Answer keys, solutions, or study materials should not be uploaded."
              },
              {
                question: "What happens if my upload is rejected?",
                answer: "If your upload is rejected, you'll receive feedback on why it was rejected and can make corrections before re-uploading."
              },
              {
                question: "Do I get credit for my uploads?",
                answer: "Yes! You earn points for each approved upload and can unlock contributor badges and special recognition in the community."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-gray-600 mb-4">
              Still have questions?
            </p>
            <motion.a
              href="/support"
              className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-colors"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span role="img" aria-label="support" className="mr-2">💬</span>
              Contact Support
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default UploadPage;