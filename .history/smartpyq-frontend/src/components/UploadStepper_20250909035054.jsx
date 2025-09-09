import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  InformationCircleIcon,
  TagIcon,
  AcademicCapIcon,
  CalendarIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const UploadStepper = ({ onUploadComplete, onCancel, className = "" }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    subject: '',
    stream: '',
    year: new Date().getFullYear(),
    semester: '',
    university: '',
    tags: [],
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);

  const steps = [
    { id: 1, title: 'Upload File', description: 'Select your PDF document' },
    { id: 2, title: 'Add Details', description: 'Provide paper information' },
    { id: 3, title: 'Review & Submit', description: 'Confirm and upload' }
  ];

  const streams = [
    'Engineering', 'Medical', 'Commerce', 'Arts', 'Science', 'Law', 'Management', 'Other'
  ];

  const semesters = [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
  ];

  // File validation
  const validateFile = (file) => {
    const errors = {};
    
    if (!file) {
      errors.file = 'Please select a file';
      return errors;
    }
    
    if (file.type !== 'application/pdf') {
      errors.file = 'Only PDF files are allowed';
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      errors.file = 'File size must be less than 50MB';
    }
    
    return errors;
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!uploadData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!uploadData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!uploadData.stream) {
      errors.stream = 'Stream is required';
    }
    
    if (!uploadData.university.trim()) {
      errors.university = 'University is required';
    }
    
    if (uploadData.year < 2000 || uploadData.year > new Date().getFullYear() + 1) {
      errors.year = 'Please enter a valid year';
    }
    
    return errors;
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const file = files[0];
    const fileErrors = validateFile(file);
    
    if (Object.keys(fileErrors).length === 0) {
      setUploadData(prev => ({ ...prev, file }));
      setErrors({});
      // Auto-advance to next step if file is valid
      setTimeout(() => setCurrentStep(2), 500);
    } else {
      setErrors(fileErrors);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setUploadData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle tag addition
  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !uploadData.tags.includes(trimmedTag)) {
      setUploadData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setUploadData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(e.target.value);
      e.target.value = '';
    }
  };

  // Navigation
  const nextStep = () => {
    if (currentStep === 2) {
      const formErrors = validateForm();
      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle final submission
  const handleSubmit = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Wait a bit to show completion
      setTimeout(() => {
        onUploadComplete?.(uploadData);
      }, 1000);
      
    } catch (error) {
      setErrors({ submit: 'Upload failed. Please try again.' });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header with steps */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upload Question Paper</h2>
          <motion.button
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close upload dialog"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-white text-brand-600'
                      : 'bg-white/20 text-white/60'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {currentStep > step.id ? (
                    <CheckCircleIconSolid className="h-6 w-6" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-white/60'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-xs ${
                    currentStep >= step.id ? 'text-white/80' : 'text-white/40'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: File Upload */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select Your PDF Document
                </h3>
                <p className="text-gray-600">
                  Upload a question paper in PDF format (max 50MB)
                </p>
              </div>

              {/* File drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                  dragActive
                    ? 'border-brand-500 bg-brand-50'
                    : uploadData.file
                    ? 'border-green-500 bg-green-50'
                    : errors.file
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Select PDF file"
                />
                
                <div className="text-center">
                  {uploadData.file ? (
                    <>
                      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <div className="flex items-center justify-center mb-2">
                        <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900">{uploadData.file.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(uploadData.file.size)} • PDF Document
                      </p>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-4 ${
                        errors.file ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your PDF here, or click to browse
                      </p>
                      <p className="text-sm text-gray-600">
                        Supports PDF files up to 50MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {errors.file && (
                <motion.div
                  className="mt-4 flex items-center text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  {errors.file}
                </motion.div>
              )}

              {uploadData.file && (
                <div className="mt-6 flex justify-end">
                  <motion.button
                    className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-colors"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Paper Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Add Paper Details
                </h3>
                <p className="text-gray-600">
                  Help others find your paper with accurate information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Title *
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Data Structures and Algorithms - Final Exam"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={uploadData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Science"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                {/* Stream */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream *
                  </label>
                  <select
                    value={uploadData.stream}
                    onChange={(e) => handleInputChange('stream', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
                      errors.stream ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Stream</option>
                    {streams.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                  {errors.stream && (
                    <p className="mt-1 text-sm text-red-600">{errors.stream}</p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Year *
                  </label>
                  <input
                    type="number"
                    value={uploadData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
                      errors.year ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={uploadData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                  >
                    <option value="">Select Semester (Optional)</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>

                {/* University */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingLibraryIcon className="h-4 w-4 inline mr-1" />
                    University *
                  </label>
                  <input
                    type="text"
                    value={uploadData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors ${
                      errors.university ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Osmania University"
                  />
                  {errors.university && (
                    <p className="mt-1 text-sm text-red-600">{errors.university}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TagIcon className="h-4 w-4 inline mr-1" />
                    Tags (Optional)
                  </label>
                  <input
                    ref={tagInputRef}
                    type="text"
                    onKeyPress={handleTagKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                    placeholder="Add tags separated by commas (e.g., algorithms, programming)"
                  />
                  {uploadData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {uploadData.tags.map((tag, index) => (
                        <motion.span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-brand-500 hover:text-brand-700 focus:outline-none"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"
                    placeholder="Add any additional information about this paper..."
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <motion.button
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-colors"
                  onClick={prevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-colors"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Review
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Review & Submit
                </h3>
                <p className="text-gray-600">
                  Please review your information before uploading
                </p>
              </div>

              {/* Review content */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File info */}
                  <div className="md:col-span-2 border-b border-gray-200 pb-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">File Information</h4>
                    <div className="flex items-center">
                      <DocumentIcon className="h-8 w-8 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadData.file?.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(uploadData.file?.size || 0)} • PDF Document
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Paper details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Paper Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Title:</span> {uploadData.title}</div>
                      <div><span className="font-medium">Subject:</span> {uploadData.subject}</div>
                      <div><span className="font-medium">Stream:</span> {uploadData.stream}</div>
                      <div><span className="font-medium">Year:</span> {uploadData.year}</div>
                      {uploadData.semester && (
                        <div><span className="font-medium">Semester:</span> {uploadData.semester}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Additional Info</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">University:</span> {uploadData.university}</div>
                      {uploadData.tags.length > 0 && (
                        <div>
                          <span className="font-medium">Tags:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {uploadData.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-brand-100 text-brand-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {uploadData.description && (
                        <div><span className="font-medium">Description:</span> {uploadData.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium text-blue-900">
                        {uploadProgress < 100 ? 'Uploading...' : 'Upload Complete!'}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                </motion.div>
              )}

              {errors.submit && (
                <motion.div
                  className="mb-6 flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  {errors.submit}
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <motion.button
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={prevStep}
                  disabled={isUploading}
                  whileHover={{ scale: isUploading ? 1 : 1.02 }}
                  whileTap={{ scale: isUploading ? 1 : 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={isUploading}
                  whileHover={{ scale: isUploading ? 1 : 1.02 }}
                  whileTap={{ scale: isUploading ? 1 : 0.98 }}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-5 w-5 inline-block mr-2" />
                      Upload Paper
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploadStepper;