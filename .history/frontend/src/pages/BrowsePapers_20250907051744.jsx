import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Download, Eye, Calendar, BookOpen, Star, TrendingUp } from 'lucide-react';

const BrowsePapers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Demo data
  const papers = [
    {
      id: 1,
      title: 'Data Structures and Algorithms Final Exam',
      subject: 'Computer Science',
      stream: 'Engineering',
      year: 2023,
      semester: 'Fall',
      university: 'Tech University',
      downloads: 1250,
      rating: 4.8,
      pages: 12,
      uploadDate: '2023-12-15',
      tags: ['algorithms', 'data-structures', 'final-exam']
    },
    {
      id: 2,
      title: 'Calculus II Midterm Examination',
      subject: 'Mathematics',
      stream: 'Engineering',
      year: 2023,
      semester: 'Spring',
      university: 'Tech University',
      downloads: 890,
      rating: 4.6,
      pages: 8,
      uploadDate: '2023-05-20',
      tags: ['calculus', 'integration', 'midterm']
    },
    {
      id: 3,
      title: 'Organic Chemistry Lab Report Guidelines',
      subject: 'Chemistry',
      stream: 'Science',
      year: 2022,
      semester: 'Fall',
      university: 'Science College',
      downloads: 567,
      rating: 4.4,
      pages: 15,
      uploadDate: '2022-11-10',
      tags: ['organic-chemistry', 'lab-report', 'guidelines']
    },
    {
      id: 4,
      title: 'Business Statistics Final Project',
      subject: 'Statistics',
      stream: 'Business',
      year: 2023,
      semester: 'Summer',
      university: 'Business School',
      downloads: 423,
      rating: 4.2,
      pages: 20,
      uploadDate: '2023-08-05',
      tags: ['statistics', 'business', 'project']
    }
  ];

  const subjects = ['all', 'Computer Science', 'Mathematics', 'Chemistry', 'Statistics', 'Physics', 'Biology'];
  const streams = ['all', 'Engineering', 'Science', 'Business', 'Arts', 'Medicine'];
  const years = ['all', 2023, 2022, 2021, 2020, 2019];

  // Filter and sort papers
  const filteredAndSortedPapers = useMemo(() => {
    let filtered = papers.filter(paper => {
      const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paper.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSubject = selectedSubject === 'all' || paper.subject === selectedSubject;
      const matchesYear = selectedYear === 'all' || paper.year === selectedYear;
      const matchesStream = selectedStream === 'all' || paper.stream === selectedStream;
      
      return matchesSearch && matchesSubject && matchesYear && matchesStream;
    });

    // Sort papers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedSubject, selectedYear, selectedStream, sortBy]);

  const PaperCard = ({ paper }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {paper.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {paper.subject}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {paper.stream}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {paper.year}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium text-gray-700">{paper.rating}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{paper.pages} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{paper.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{paper.semester} {paper.year}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const PaperListItem = ({ paper }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {paper.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span>{paper.subject}</span>
            <span>•</span>
            <span>{paper.stream}</span>
            <span>•</span>
            <span>{paper.year}</span>
            <span>•</span>
            <span>{paper.pages} pages</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {paper.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-500 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-gray-700">{paper.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Download className="w-4 h-4" />
              <span className="text-sm">{paper.downloads}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rainbow-gradient text-white py-2 px-4 rounded-lg bounce-glow flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 rainbow-gradient text-white p-4 rounded-lg floating">Browse Question Papers</h1>
          <p className="text-gray-600 pulse-rainbow">Discover and download previous year question papers from various subjects and streams</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search papers, subjects, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg glow-pulse"
                />
              </div>
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {streams.map(stream => (
                <option key={stream} value={stream}>
                  {stream === 'all' ? 'All Streams' : stream}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredAndSortedPapers.length} papers found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Papers Grid/List */}
        {filteredAndSortedPapers.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredAndSortedPapers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {viewMode === 'grid' ? (
                  <PaperCard paper={paper} />
                ) : (
                  <PaperListItem paper={paper} />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePapers;