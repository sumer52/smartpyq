import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  FileText,
  Download,
  Eye,
  Calendar,
  Award,
  BookOpen,
  Clock,
  Target,
  Filter,
  RefreshCw
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Demo data - in real app, this would come from API
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalPapers: 1247,
      totalDownloads: 8934,
      totalViews: 23456,
      activeUsers: 567
    },
    trending: {
      subjects: [
        { name: 'Data Structures', papers: 89, downloads: 1234, growth: 15.3 },
        { name: 'Algorithms', papers: 76, downloads: 987, growth: 12.8 },
        { name: 'Database Management', papers: 65, downloads: 876, growth: 9.2 },
        { name: 'Operating Systems', papers: 54, downloads: 743, growth: 7.1 },
        { name: 'Computer Networks', papers: 43, downloads: 621, growth: 5.4 }
      ],
      papers: [
        {
          title: 'Data Structures Final Exam 2023',
          subject: 'Data Structures',
          downloads: 234,
          views: 567,
          university: 'MIT',
          year: 2023
        },
        {
          title: 'Algorithms Mid-term 2023',
          subject: 'Algorithms',
          downloads: 198,
          views: 445,
          university: 'Stanford',
          year: 2023
        },
        {
          title: 'DBMS Comprehensive Exam',
          subject: 'Database Management',
          downloads: 176,
          views: 389,
          university: 'Berkeley',
          year: 2023
        }
      ]
    },
    userStats: {
      papersUploaded: 12,
      papersDownloaded: 45,
      studyStreak: 7,
      favoriteSubject: 'Data Structures',
      totalStudyTime: '24h 30m',
      achievements: [
        { name: 'Early Adopter', description: 'Joined in the first month', icon: Award },
        { name: 'Knowledge Sharer', description: 'Uploaded 10+ papers', icon: BookOpen },
        { name: 'Study Streak', description: '7 days consecutive activity', icon: Target }
      ]
    },
    chartData: {
      downloads: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [120, 150, 180, 200, 170, 140, 160]
      },
      subjects: {
        labels: ['Data Structures', 'Algorithms', 'DBMS', 'OS', 'Networks'],
        data: [30, 25, 20, 15, 10]
      }
    }
  });

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const StatCard = ({ title, value, icon: Icon, change, color = 'primary' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${
                change < 0 ? 'rotate-180' : ''
              }`} />
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          color === 'primary' ? 'bg-primary-100 text-primary-600' :
          color === 'green' ? 'bg-green-100 text-green-600' :
          color === 'blue' ? 'bg-blue-100 text-blue-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  const SimpleBarChart = ({ data, labels, title }) => {
    const maxValue = Math.max(...data);
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        
        <div className="space-y-4">
          {data.map((value, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600 text-right">
                {labels[index]}
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / maxValue) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                />
              </div>
              
              <div className="w-12 text-sm font-medium text-gray-900 text-right">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TrendingSubjectCard = ({ subject, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{subject.name}</h4>
        <span className={`text-sm px-2 py-1 rounded-full ${
          subject.growth > 10 ? 'bg-green-100 text-green-700' :
          subject.growth > 5 ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          +{subject.growth}%
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Papers</p>
          <p className="font-semibold text-gray-900">{subject.papers}</p>
        </div>
        <div>
          <p className="text-gray-600">Downloads</p>
          <p className="font-semibold text-gray-900">{subject.downloads}</p>
        </div>
      </div>
    </motion.div>
  );

  const TrendingPaperCard = ({ paper, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 line-clamp-2">{paper.title}</h4>
        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
          #{index + 1}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{paper.subject} • {paper.university} • {paper.year}</p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <Download className="w-4 h-4" />
            <span>{paper.downloads}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span>{paper.views}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const AchievementBadge = ({ achievement, index }) => {
    const Icon = achievement.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <h4 className="font-medium text-gray-900 mb-1">{achievement.name}</h4>
        <p className="text-sm text-gray-600">{achievement.description}</p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your study progress and platform insights
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Papers"
            value={analyticsData.overview.totalPapers.toLocaleString()}
            icon={FileText}
            change={8.2}
            color="primary"
          />
          <StatCard
            title="Total Downloads"
            value={analyticsData.overview.totalDownloads.toLocaleString()}
            icon={Download}
            change={12.5}
            color="green"
          />
          <StatCard
            title="Total Views"
            value={analyticsData.overview.totalViews.toLocaleString()}
            icon={Eye}
            change={-2.1}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={analyticsData.overview.activeUsers.toLocaleString()}
            icon={Users}
            change={15.8}
            color="purple"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Downloads Chart */}
          <div className="lg:col-span-2">
            <SimpleBarChart
              data={analyticsData.chartData.downloads.data}
              labels={analyticsData.chartData.downloads.labels}
              title="Downloads This Week"
            />
          </div>
          
          {/* Personal Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Papers Uploaded</span>
                <span className="font-semibold text-gray-900">{analyticsData.userStats.papersUploaded}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Papers Downloaded</span>
                <span className="font-semibold text-gray-900">{analyticsData.userStats.papersDownloaded}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Study Streak</span>
                <span className="font-semibold text-primary-600">{analyticsData.userStats.studyStreak} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Favorite Subject</span>
                <span className="font-semibold text-gray-900">{analyticsData.userStats.favoriteSubject}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Study Time</span>
                <span className="font-semibold text-gray-900">{analyticsData.userStats.totalStudyTime}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trending Subjects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Subjects</h3>
            
            <div className="space-y-4">
              {analyticsData.trending.subjects.map((subject, index) => (
                <TrendingSubjectCard key={subject.name} subject={subject} index={index} />
              ))}
            </div>
          </motion.div>
          
          {/* Trending Papers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Papers</h3>
            
            <div className="space-y-4">
              {analyticsData.trending.papers.map((paper, index) => (
                <TrendingPaperCard key={paper.title} paper={paper} index={index} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.userStats.achievements.map((achievement, index) => (
              <AchievementBadge key={achievement.name} achievement={achievement} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;