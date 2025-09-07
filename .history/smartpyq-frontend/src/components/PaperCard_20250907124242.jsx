import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  TagIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';

const PaperCard = ({ 
  paper, 
  onView, 
  onDownload, 
  onFavorite,
  className = "",
  showActions = true,
  compact = false 
}) => {
  const [isLiked, setIsLiked] = useState(paper?.isLiked || false);
  const [isLoading, setIsLoading] = useState(false);

  // Default paper data if not provided
  const defaultPaper = {
    id: 1,
    title: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    stream: 'Engineering',
    year: 2023,
    semester: 'Semester 5',
    university: 'Delhi University',
    uploader: 'John Doe',
    uploadDate: '2024-01-15',
    tags: ['algorithms', 'data-structures', 'programming'],
    fileSize: '2.4 MB',
    pages: 12,
    downloads: 1250,
    rating: 4.5,
    difficulty: 'Medium',
    isLiked: false,
    thumbnail: null
  };

  const paperData = paper || defaultPaper;

  const handleView = async () => {
    if (onView) {
      setIsLoading(true);
      try {
        await onView(paperData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      setIsLoading(true);
      try {
        await onDownload(paperData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFavorite = () => {
    setIsLiked(!isLiked);
    if (onFavorite) {
      onFavorite(paperData, !isLiked);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const cardVariants = {
    hover: {
      y: -4,
      scale: 1.01,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.95
    }
  };

  if (compact) {
    return (
      <motion.div
        className={`bg-white rounded-lg border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all duration-200 p-4 ${className}`}
        whileHover="hover"
        whileTap="tap"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{paperData.title}</h3>
            <p className="text-sm text-gray-600 truncate">{paperData.subject} • {paperData.year}</p>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <motion.button
                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleView}
                disabled={isLoading}
                aria-label={`View ${paperData.title}`}
              >
                <EyeIcon className="h-4 w-4" />
              </motion.button>
              <motion.button
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/30"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleDownload}
                disabled={isLoading}
                aria-label={`Download ${paperData.title}`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300 overflow-hidden group ${className}`}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
    >
      {/* Card header with thumbnail/icon */}
      <div className="relative h-32 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
        {paperData.thumbnail ? (
          <img 
            src={paperData.thumbnail} 
            alt={`${paperData.title} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <AcademicCapIcon className="h-12 w-12 text-brand-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-brand-600">{paperData.subject}</span>
          </div>
        )}
        
        {/* Favorite button */}
        <motion.button
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleFavorite}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isLiked ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIconOutline className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
          )}
        </motion.button>

        {/* Difficulty badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(paperData.difficulty)}`}>
          {paperData.difficulty}
        </div>
      </div>

      {/* Card content */}
      <div className="p-6">
        {/* Title and basic info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
            {paperData.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {paperData.year}
            </div>
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-4 w-4 mr-1" />
              {paperData.university}
            </div>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{paperData.stream}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{paperData.uploader}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatDate(paperData.uploadDate)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{paperData.downloads.toLocaleString()}</span>
          </div>
        </div>

        {/* Tags */}
        {paperData.tags && paperData.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {paperData.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {paperData.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{paperData.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* File info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{paperData.fileSize}</span>
          <span>{paperData.pages} pages</span>
          {paperData.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{paperData.rating}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex space-x-3">
            <motion.button
              className="flex-1 flex items-center justify-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleView}
              disabled={isLoading}
              aria-label={`View ${paperData.title}`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'View'}
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleDownload}
              disabled={isLoading}
              aria-label={`Download ${paperData.title}`}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </motion.button>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
            <span className="text-brand-600 font-medium">Processing...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaperCard;