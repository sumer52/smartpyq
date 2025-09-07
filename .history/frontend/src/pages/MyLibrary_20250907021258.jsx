import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Eye,
  Heart,
  Share2,
  Trash2,
  Edit3,
  Calendar,
  User,
  Tag,
  Star,
  Clock,
  FileText,
  Upload,
  FolderOpen,
  SortAsc,
  SortDesc,
  MoreVertical
} from 'lucide-react';

const MyLibrary = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    year: '',
    university: '',
    status: ''
  });

  // Demo data - in real app, this would come from API
  const [libraryData, setLibraryData] = useState({
    saved: [
      {
        id: 1,
        title: 'Data Structures and Algorithms Final Exam 2023',
        subject: 'Data Structures',
        university: 'MIT',
        year: 2023,
        uploadedBy: 'John Doe',
        savedAt: new Date('2024-01-15'),
        downloads: 234,
        views: 567,
        rating: 4.8,
        tags: ['Final', 'DSA', 'Trees', 'Graphs'],
        fileSize: '2.4 MB',
        pages: 12
      },
      {
        id: 2,
        title: 'Database Management Systems Mid-term',
        subject: 'Database Management',
        university: 'Stanford',
        year: 2023,
        uploadedBy: 'Jane Smith',
        savedAt: new Date('2024-01-10'),
        downloads: 189,
        views: 445,
        rating: 4.6,
        tags: ['Mid-term', 'SQL', 'Normalization'],
        fileSize: '1.8 MB',
        pages: 8
      },
      {
        id: 3,
        title: 'Operating Systems Comprehensive Exam',
        subject: 'Operating Systems',
        university: 'Berkeley',
        year: 2022,
        uploadedBy: 'Mike Johnson',
        savedAt: new Date('2024-01-08'),
        downloads: 156,
        views: 389,
        rating: 4.7,
        tags: ['Comprehensive', 'Processes', 'Memory'],
        fileSize: '3.1 MB',
        pages: 15
      }
    ],
    uploaded: [
      {
        id: 4,
        title: 'Computer Networks Final Project Report',
        subject: 'Computer Networks',
        university: 'MIT',
        year: 2023,
        uploadedAt: new Date('2024-01-12'),
        downloads: 67,
        views: 123,
        rating: 4.5,
        status: 'approved',
        tags: ['Project', 'TCP/IP', 'Routing'],
        fileSize: '4.2 MB',
        pages: 20
      },
      {
        id: 5,
        title: 'Machine Learning Assignment Solutions',
        subject: 'Machine Learning',
        university: 'MIT',
        year: 2023,
        uploadedAt: new Date('2024-01-05'),
        downloads: 89,
        views: 234,
        rating: 4.3,
        status: 'pending',
        tags: ['Assignment', 'Neural Networks', 'Classification'],
        fileSize: '2.7 MB',
        pages: 10
      }
    ]
  });

  const tabs = [
    { id: 'saved', label: 'Saved Papers', count: libraryData.saved.length },
    { id: 'uploaded', label: 'My Uploads', count: libraryData.uploaded.length }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'subject', label: 'Subject' },
    { value: 'downloads', label: 'Downloads' },
    { value: 'rating', label: 'Rating' }
  ];

  const getCurrentPapers = () => {
    const papers = libraryData[activeTab] || [];
    
    // Apply search filter
    let filteredPapers = papers.filter(paper =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.university.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply filters
    if (filters.subject) {
      filteredPapers = filteredPapers.filter(paper => 
        paper.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }
    if (filters.year) {
      filteredPapers = filteredPapers.filter(paper => 
        paper.year.toString() === filters.year
      );
    }
    if (filters.university) {
      filteredPapers = filteredPapers.filter(paper => 
        paper.university.toLowerCase().includes(filters.university.toLowerCase())
      );
    }
    if (filters.status && activeTab === 'uploaded') {
      filteredPapers = filteredPapers.filter(paper => 
        paper.status === filters.status
      );
    }

    // Apply sorting
    filteredPapers.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = activeTab === 'saved' ? a.savedAt : a.uploadedAt;
          bValue = activeTab === 'saved' ? b.savedAt : b.uploadedAt;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'subject':
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case 'downloads':
          aValue = a.downloads;
          bValue = b.downloads;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredPapers;
  };

  const handlePaperSelect = (paperId) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on papers:`, selectedPapers);
    // Implement bulk actions here
    setSelectedPapers([]);
  };

  const PaperCard = ({ paper, isSelected, onSelect }) => {
    const isUploaded = activeTab === 'uploaded';
    const dateField = isUploaded ? paper.uploadedAt : paper.savedAt;
    const dateLabel = isUploaded ? 'Uploaded' : 'Saved';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        className={`bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer ${
          isSelected ? 'border-primary-500 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onClick={() => onSelect(paper.id)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                {paper.title}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{paper.subject}</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{paper.year}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isUploaded && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  paper.status === 'approved' ? 'bg-green-100 text-green-700' :
                  paper.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {paper.status}
                </span>
              )}
              
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* University and Author */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">{paper.university}</span>
            {!isUploaded && (
              <span className="text-sm text-gray-600 flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{paper.uploadedBy}</span>
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {paper.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {paper.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{paper.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{paper.downloads}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{paper.views}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{paper.rating}</span>
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              {paper.fileSize} • {paper.pages} pages
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{dateLabel} {dateField.toLocaleDateString()}</span>
            </span>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-200"
                title="Remove from library"
              >
                <Heart className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors duration-200"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors duration-200"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const PaperListItem = ({ paper, isSelected, onSelect }) => {
    const isUploaded = activeTab === 'uploaded';
    const dateField = isUploaded ? paper.uploadedAt : paper.savedAt;
    const dateLabel = isUploaded ? 'Uploaded' : 'Saved';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer ${
          isSelected ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onSelect(paper.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1 mr-4">
                {paper.title}
              </h3>
              
              {isUploaded && (
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                  paper.status === 'approved' ? 'bg-green-100 text-green-700' :
                  paper.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {paper.status}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
              <span>{paper.subject}</span>
              <span>{paper.university}</span>
              <span>{paper.year}</span>
              {!isUploaded && <span>by {paper.uploadedBy}</span>}
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{paper.downloads} downloads</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{paper.views} views</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{paper.rating}</span>
              </span>
              
              <span>{paper.fileSize}</span>
              
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{dateLabel} {dateField.toLocaleDateString()}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-200"
            >
              <Heart className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  const currentPapers = getCurrentPapers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">
            Manage your saved papers and uploads
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
            
            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200 ${
                showFilters ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
            
            {/* View Mode */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors duration-200 ${
                  viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by subject"
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by year"
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by university"
                    value={filters.university}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                {activeTab === 'uploaded' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedPapers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-primary-700 font-medium">
                  {selectedPapers.length} paper{selectedPapers.length > 1 ? 's' : ''} selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('download')}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Download All
                  </button>
                  
                  <button
                    onClick={() => handleBulkAction('remove')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Remove All
                  </button>
                  
                  <button
                    onClick={() => setSelectedPapers([])}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Papers Grid/List */}
        <AnimatePresence mode="wait">
          {currentPapers.length > 0 ? (
            <motion.div
              key={`${activeTab}-${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }
            >
              {currentPapers.map((paper) => (
                viewMode === 'grid' ? (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isSelected={selectedPapers.includes(paper.id)}
                    onSelect={handlePaperSelect}
                  />
                ) : (
                  <PaperListItem
                    key={paper.id}
                    paper={paper}
                    isSelected={selectedPapers.includes(paper.id)}
                    onSelect={handlePaperSelect}
                  />
                )
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No papers found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters'
                  : activeTab === 'saved' 
                    ? 'Start saving papers to build your library'
                    : 'Upload your first paper to get started'
                }
              </p>
              
              {activeTab === 'uploaded' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Paper</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyLibrary;