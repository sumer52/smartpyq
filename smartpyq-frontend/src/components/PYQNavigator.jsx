import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Filter, BookOpen, Calendar, GraduationCap, FileText } from 'lucide-react';
import { pyqData, getYears, getSemesters, getExamYears, getStreams, getSpecializations, getSubjects } from '../data/pyqData';

const PYQNavigator = () => {
  const [currentLevel, setCurrentLevel] = useState('years'); // years, semesters, examYears, streams, subjects
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedExamYear, setSelectedExamYear] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Navigation breadcrumb
  const getBreadcrumb = () => {
    const breadcrumb = [];
    if (selectedYear) breadcrumb.push(selectedYear.displayName);
    if (selectedSemester) breadcrumb.push(selectedSemester.displayName);
    if (selectedExamYear) breadcrumb.push(selectedExamYear.toString());
    if (selectedStream) breadcrumb.push(selectedStream.displayName);
    if (selectedSpecialization) breadcrumb.push(selectedSpecialization.displayName);
    return breadcrumb;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Navigation handlers
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setCurrentLevel('semesters');
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(semester);
    setCurrentLevel('examYears');
  };

  const handleExamYearSelect = (examYear) => {
    setSelectedExamYear(examYear);
    setCurrentLevel('streams');
  };

  const handleStreamSelect = (streamKey, stream) => {
    setSelectedStream({ ...stream, key: streamKey });
    setCurrentLevel('specializations');
  };

  const handleSpecializationSelect = (specializationKey, specialization) => {
    setSelectedSpecialization({ ...specialization, key: specializationKey });
    setCurrentLevel('subjects');
  };

  const handleBack = () => {
    switch (currentLevel) {
      case 'semesters':
        setCurrentLevel('years');
        setSelectedYear(null);
        break;
      case 'examYears':
        setCurrentLevel('semesters');
        setSelectedSemester(null);
        break;
      case 'streams':
        setCurrentLevel('examYears');
        setSelectedExamYear(null);
        break;
      case 'specializations':
        setCurrentLevel('streams');
        setSelectedStream(null);
        break;
      case 'subjects':
        setCurrentLevel('specializations');
        setSelectedSpecialization(null);
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setCurrentLevel('years');
    setSelectedYear(null);
    setSelectedSemester(null);
    setSelectedExamYear(null);
    setSelectedStream(null);
    setSelectedSpecialization(null);
    setSearchTerm('');
  };

  // Render functions for different levels
  const renderYears = () => {
    const years = getYears();
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {years.map((year) => (
          <motion.div
            key={year.id}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors"
            onClick={() => handleYearSelect(year)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{year.displayName}</h3>
              <p className="text-gray-600">Semesters {year.semesters.map(s => s.displayName.split(' ')[1]).join(', ')}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderSemesters = () => {
    const semesters = getSemesters(selectedYear.id);
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {semesters.map((semester) => (
          <motion.div
            key={semester.id}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer border-2 border-transparent hover:border-green-500 transition-colors"
            onClick={() => handleSemesterSelect(semester)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{semester.displayName}</h3>
              <p className="text-gray-600">{semester.name}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderExamYears = () => {
    const examYears = getExamYears();
    return (
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {examYears.map((year) => (
          <motion.div
            key={year}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-orange-500 transition-colors"
            onClick={() => handleExamYearSelect(year)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{year}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderStreams = () => {
    const streams = getStreams();
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {Object.entries(streams).map(([key, stream]) => (
          <motion.div
            key={key}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-purple-500 transition-colors"
            onClick={() => handleStreamSelect(key, stream)}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{stream.displayName.split(' ')[0]}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{stream.displayName}</h3>
              <p className="text-gray-600 text-sm">
                {Object.keys(stream.specializations).length} specialization{Object.keys(stream.specializations).length > 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderSpecializations = () => {
    const specializations = getSpecializations(selectedStream.key);
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {Object.entries(specializations).map(([key, specialization]) => (
          <motion.div
            key={key}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-colors"
            onClick={() => handleSpecializationSelect(key, specialization)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{specialization.displayName}</h3>
              <p className="text-gray-600 text-sm">{specialization.name}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderSubjects = () => {
    const subjects = getSubjects(selectedStream.key, selectedSpecialization.key, selectedSemester.id);
    const filteredSubjects = subjects.filter(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Mock paper data for each subject
    const mockPapers = {
      'Data Structures': [
        { id: 1, title: 'Data Structures - Mid Term 2023', year: '2023', type: 'Mid Term', pages: 8, downloads: 1250, rating: 4.8, size: '2.3 MB' },
        { id: 2, title: 'Data Structures - Final Exam 2023', year: '2023', type: 'Final', pages: 12, downloads: 2100, rating: 4.9, size: '3.1 MB' },
        { id: 3, title: 'Data Structures - Practice Set 2023', year: '2023', type: 'Practice', pages: 15, downloads: 890, rating: 4.7, size: '2.8 MB' }
      ],
      'Algorithms': [
        { id: 4, title: 'Algorithms - Mid Term 2023', year: '2023', type: 'Mid Term', pages: 10, downloads: 980, rating: 4.6, size: '2.5 MB' },
        { id: 5, title: 'Algorithms - Final Exam 2023', year: '2023', type: 'Final', pages: 14, downloads: 1650, rating: 4.8, size: '3.4 MB' }
      ],
      'Database Systems': [
        { id: 6, title: 'Database Systems - Mid Term 2023', year: '2023', type: 'Mid Term', pages: 9, downloads: 1100, rating: 4.7, size: '2.1 MB' },
        { id: 7, title: 'Database Systems - Final Exam 2023', year: '2023', type: 'Final', pages: 13, downloads: 1800, rating: 4.9, size: '3.2 MB' }
      ]
    };

    return (
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {filteredSubjects.map((subject, index) => {
          const papers = mockPapers[subject] || [
            { id: index + 100, title: `${subject} - Sample Paper`, year: '2023', type: 'Sample', pages: 8, downloads: 500, rating: 4.5, size: '2.0 MB' }
          ];
          
          return (
            <motion.div
              key={subject}
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Subject Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📖</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{subject}</h3>
                      <p className="text-indigo-100">
                        {selectedYear?.displayName} • {selectedSemester?.displayName} • {selectedExamYear}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{papers.length}</div>
                    <div className="text-indigo-100 text-sm">Papers Available</div>
                  </div>
                </div>
              </div>
              
              {/* Papers List */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {papers.map((paper) => (
                    <motion.div
                      key={paper.id}
                      className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                            {paper.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              paper.type === 'Final' ? 'bg-red-100 text-red-600' :
                              paper.type === 'Mid Term' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {paper.type}
                            </span>
                            <span>{paper.year}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <span className="text-sm">⭐</span>
                          <span className="text-sm font-medium text-gray-700">{paper.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <span>📄</span>
                            <span>{paper.pages} pages</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>💾</span>
                            <span>{paper.size}</span>
                          </span>
                        </div>
                        <span className="flex items-center space-x-1">
                          <span>⬇️</span>
                          <span>{paper.downloads.toLocaleString()}</span>
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-1"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Downloading ${paper.title}...`);
                          }}
                        >
                          <span>⬇️</span>
                          <span>Download</span>
                        </motion.button>
                        <motion.button
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Previewing ${paper.title}...`);
                          }}
                        >
                          👁️
                        </motion.button>
                        <motion.button
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Added ${paper.title} to favorites!`);
                          }}
                        >
                          ❤️
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Load More Button */}
                <div className="text-center mt-6">
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all flex items-center space-x-2 mx-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>📚</span>
                    <span>Load More Papers</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const getCurrentTitle = () => {
    switch (currentLevel) {
      case 'years': return 'Select Academic Year';
      case 'semesters': return `Select Semester - ${selectedYear?.displayName}`;
      case 'examYears': return `Select Exam Year - ${selectedSemester?.displayName}`;
      case 'streams': return `Select Stream - ${selectedExamYear}`;
      case 'specializations': return `Select Specialization - ${selectedStream?.displayName}`;
      case 'subjects': return `Select Subject - ${selectedSpecialization?.displayName}`;
      default: return 'PYQ Navigator';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            PYQ Navigator
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Navigate through years, semesters, and streams to find your Previous Year Question papers
          </motion.p>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {currentLevel !== 'years' && (
              <motion.button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </motion.button>
            )}
            <motion.button
              onClick={handleReset}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            {currentLevel === 'subjects' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>
          </div>
        </div>

        {/* Breadcrumb */}
        {getBreadcrumb().length > 0 && (
          <motion.div 
            className="flex items-center gap-2 mb-6 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span>Navigation:</span>
            {getBreadcrumb().map((item, index) => (
              <React.Fragment key={index}>
                <span className="font-medium">{item}</span>
                {index < getBreadcrumb().length - 1 && <span>→</span>}
              </React.Fragment>
            ))}
          </motion.div>
        )}

        {/* Current Level Title */}
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8"
          key={currentLevel}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {getCurrentTitle()}
        </motion.h2>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentLevel}>
            {currentLevel === 'years' && renderYears()}
            {currentLevel === 'semesters' && renderSemesters()}
            {currentLevel === 'examYears' && renderExamYears()}
            {currentLevel === 'streams' && renderStreams()}
            {currentLevel === 'specializations' && renderSpecializations()}
            {currentLevel === 'subjects' && renderSubjects()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PYQNavigator;