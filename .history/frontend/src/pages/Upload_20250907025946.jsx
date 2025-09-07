import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload as UploadIcon, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Calendar,
  GraduationCap,
  Tag,
  User,
  Building
} from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    stream: '',
    year: '',
    semester: '',
    university: '',
    examType: '',
    tags: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const subjects = [
    'Data Structures',
    'Algorithms',
    'Database Management',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'Cybersecurity',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Other'
  ];

  const streams = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'MBA',
    'BBA',
    'B.Com',
    'B.Sc',
    'BA',
    'Other'
  ];

  const examTypes = [
    'Final Exam',
    'Mid Term',
    'Assignment',
    'Quiz',
    'Project',
    'Lab Exam',
    'Viva',
    'Other'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setErrors({ file: 'Please upload a PDF file only.' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 10MB.' });
      return;
    }

    setErrors({});
    setUploadedFile(file);
    
    // Auto-fill title from filename if empty
    if (!formData.title) {
      const fileName = file.name.replace('.pdf', '').replace(/[_-]/g, ' ');
      setFormData(prev => ({ ...prev, title: fileName }));
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!uploadedFile) newErrors.file = 'Please select a PDF file to upload.';
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.subject) newErrors.subject = 'Subject is required.';
    if (!formData.stream) newErrors.stream = 'Stream is required.';
    if (!formData.year) newErrors.year = 'Year is required.';
    if (!formData.university.trim()) newErrors.university = 'University is required.';
    if (!formData.examType) newErrors.examType = 'Exam type is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setUploadProgress(100);
      setUploadComplete(true);
      setIsUploading(false);
      
      // Reset form after successful upload
      setTimeout(() => {
        setUploadedFile(null);
        setUploadProgress(0);
        setUploadComplete(false);
        setFormData({
          title: '',
          subject: '',
          stream: '',
          year: '',
          semester: '',
          university: '',
          examType: '',
          tags: '',
          description: ''
        });
      }, 2000);
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4"
            >
              <UploadIcon className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upload Question Paper
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your question papers with the community and help fellow students prepare better.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8">
            {/* File Upload Area */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Upload PDF File *
              </label>
              
              {!uploadedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <motion.div
                    animate={{ scale: dragActive ? 1.05 : 1 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <UploadIcon className="w-8 h-8 text-primary-600" />
                    </div>
                    
                    <div>
                      <p className="text-xl font-medium text-gray-900 mb-2">
                        {dragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                      </p>
                      <p className="text-gray-600 mb-4">
                        or click to browse files
                      </p>
                      <p className="text-sm text-gray-500">
                        Maximum file size: 10MB • PDF format only
                      </p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Uploading...</span>
                        <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-primary-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Complete */}
                  {uploadComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center space-x-2 text-green-600"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Upload completed successfully!</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {errors.file && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.file}</span>
                </motion.p>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.title ? 'border-red-300' : ''}`}
                    placeholder="e.g., Data Structures Final Exam 2023"
                  />
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`input-field ${errors.subject ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              {/* Stream */}
              <div>
                <label htmlFor="stream" className="block text-sm font-medium text-gray-700 mb-2">
                  Stream/Course *
                </label>
                <select
                  id="stream"
                  name="stream"
                  value={formData.stream}
                  onChange={handleInputChange}
                  className={`input-field ${errors.stream ? 'border-red-300' : ''}`}
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
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`input-field ${errors.year ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                  Semester (Optional)
                </label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Semester 3, Final Year"
                />
              </div>

              {/* University */}
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                  University/College *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.university ? 'border-red-300' : ''}`}
                    placeholder="e.g., Delhi University"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.university && (
                  <p className="mt-1 text-sm text-red-600">{errors.university}</p>
                )}
              </div>

              {/* Exam Type */}
              <div>
                <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type *
                </label>
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  className={`input-field ${errors.examType ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Exam Type</option>
                  {examTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.examType && (
                  <p className="mt-1 text-sm text-red-600">{errors.examType}</p>
                )}
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="e.g., algorithms, sorting, trees (comma separated)"
                  />
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Add relevant tags to help others find your paper easily
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Add any additional information about this paper..."
                />
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{errors.submit}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>By uploading, you agree to share this content with the SmartPYQ community.</p>
              </div>
              
              <motion.button
                type="submit"
                disabled={isUploading || uploadComplete}
                whileHover={{ scale: isUploading ? 1 : 1.02 }}
                whileTap={{ scale: isUploading ? 1 : 0.98 }}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : uploadComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Uploaded!</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-5 h-5" />
                    <span>Upload Paper</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;