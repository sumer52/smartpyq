import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import PaperCard from '../components/PaperCard';
import { apiClient } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'date', 'downloads', 'rating'
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || '',
    stream: searchParams.get('stream') || '',
    year: searchParams.get('year') || '',
    university: searchParams.get('university') || '',
    difficulty: searchParams.get('difficulty') || '',
    semester: searchParams.get('semester') || '',
    language: searchParams.get('language') || ''
  });
  const [query, setQuery] = useState(searchParams.get('q') || '');
  
  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  const itemsPerPage = 12;

  // Available filter options
  const filterOptions = {
    streams: ['MSCS', 'MSDS', 'Life Sciences', 'General', 'Engineering', 'Science', 'Commerce', 'Arts', 'Medical', 'Law'],
    subjects: [
      'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Accounting', 'Economics', 'English', 'History', 'Geography',
      'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'
    ],
    universities: [
      'Osmania University', 'Mumbai University', 'Calcutta University',
      'Chennai University', 'Bangalore University', 'Pune University',
      'Hyderabad University', 'Ahmedabad University'
    ],
    difficulties: ['Easy', 'Medium', 'Hard'],
    semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    years: Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString()),
    languages: ['Hindi', 'English', 'Telugu']
  };

  const searchPapers = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
      }

      const searchFilters = {
        ...debouncedFilters,
        page,
        limit: itemsPerPage,
        sort: sortBy
      };

      const response = await apiClient.searchPapers({
        q: debouncedQuery,
        ...searchFilters
      });

      const newPapers = response.papers || [];
      
      if (append) {
        setPapers(prev => [...prev, ...newPapers]);
      } else {
        setPapers(newPapers);
      }
      
      setTotalCount(response.total || 0);
      setHasMore(newPapers.length === itemsPerPage && (page * itemsPerPage) < (response.total || 0));
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search papers. Please try again.');
      
      // Fallback to mock data on first load
      if (!append && page === 1) {
        const mockPapers = Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          title: `Sample Paper ${i + 1} - ${['Mathematics', 'Physics', 'Chemistry', 'Computer Science'][i % 4]}`,
          subject: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'][i % 4],
          stream: ['Engineering', 'Science', 'Commerce'][i % 3],
          year: 2023 - (i % 3),
          semester: `Semester ${(i % 6) + 1}`,
          university: ['Osmania University', 'Mumbai University', 'Calcutta University'][i % 3],
          difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
          tags: ['sample', 'mock-data'],
          uploadedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          downloadCount: Math.floor(Math.random() * 1000) + 100,
          rating: 4 + Math.random(),
          fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
          pages: Math.floor(Math.random() * 20) + 5
        }));
        
        setPapers(mockPapers);
        setTotalCount(mockPapers.length);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, debouncedFilters, sortBy]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, debouncedFilters, sortBy, setSearchParams]);

  // Search when query or filters change
  useEffect(() => {
    searchPapers(1, false);
  }, [searchPapers]);

  const handleSearch = (newQuery, newFilters) => {
    setQuery(newQuery);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      searchPapers(currentPage + 1, true);
    }
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      stream: '',
      year: '',
      university: '',
      difficulty: '',
      semester: '',
      language: ''
    });
    setQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (query ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <span role="img" aria-label="search">🔍</span> Browse Question Papers
            </h1>
            <p className="text-lg text-gray-600">
              Discover and download previous year question papers from top universities
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div 
            className="lg:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium focus:outline-none"
                  >
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Stream Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream
                  </label>
                  <select
                    value={filters.stream}
                    onChange={(e) => handleFilterChange('stream', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Streams</option>
                    {filterOptions.streams.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Subjects</option>
                    {filterOptions.subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* University Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University
                  </label>
                  <select
                    value={filters.university}
                    onChange={(e) => handleFilterChange('university', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Universities</option>
                    {filterOptions.universities.map(university => (
                      <option key={university} value={university}>{university}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Years</option>
                    {filterOptions.years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Semesters</option>
                    {filterOptions.semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Difficulties</option>
                    {filterOptions.difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      🌐 Language
                    </span>
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">All Languages</option>
                    {filterOptions.languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SearchBar 
                onSearch={handleSearch}
                initialQuery={query}
                placeholder="Search papers by title, subject, or keywords..."
                showFilters={false}
              />
            </motion.div>

            {/* Results Header */}
            <motion.div 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {isLoading ? 'Searching...' : `${totalCount.toLocaleString()} papers found`}
                </p>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                  <option value="downloads">Sort by Downloads</option>
                  <option value="rating">Sort by Rating</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="List view"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Error State */}
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-600 mb-2">{error}</p>
                <button 
                  onClick={() => searchPapers(1, false)}
                  className="text-red-700 hover:text-red-800 underline focus:outline-none"
                >
                  Try again
                </button>
              </motion.div>
            )}

            {/* Results Grid/List */}
            <AnimatePresence mode="wait">
              {isLoading && papers.length === 0 ? (
                <motion.div 
                  key="loading"
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(9)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
                    </div>
                  ))}
                </motion.div>
              ) : papers.length === 0 ? (
                <motion.div 
                  key="empty"
                  className="text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="text-6xl mb-4" role="img" aria-label="no results">📭</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No papers found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-colors"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {papers.map((paper, index) => (
                    <motion.div
                      key={paper.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PaperCard 
                        paper={paper} 
                        layout={viewMode === 'grid' ? 'full' : 'compact'}
                        showActions={true}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && papers.length > 0 && (
              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More Papers'
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;