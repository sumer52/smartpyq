import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    course: user?.course || '',
    year: user?.year || '',
    semester: user?.semester || ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    publicProfile: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const courses = [
    'B.Sc Computer Science',
    'B.Sc Data Science',
    'B.Sc Life Sciences',
    'B.Com General',
    'B.Com Computers',
    'B.Com Honours',
    'B.Com Business Analytics',
    'BBA General',
    'BBA Business Analytics',
    'BCA'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year'];
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    updateUser(editForm);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Simulate password change
    setShowPasswordChange(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                👤 Profile Settings
              </span>
            </h1>
            <p className="text-xl text-gray-600">Manage your account and preferences</p>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative inline-block mb-6">
                    <img
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200"
                      src={user?.avatar}
                      alt={user?.name}
                    />
                    <motion.button
                      className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <CameraIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
                  <p className="text-gray-600 mb-1">{user?.course}</p>
                  <p className="text-gray-500 text-sm">{user?.year} • {user?.semester}</p>
                  
                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-indigo-600">{user?.stats?.papersDownloaded || 0}</div>
                      <div className="text-sm text-gray-600">Papers Downloaded</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">{user?.stats?.studyStreak || 0}</div>
                      <div className="text-sm text-gray-600">Study Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <UserCircleIcon className="h-6 w-6 mr-3 text-indigo-600" />
                    Personal Information
                  </h3>
                  {!isEditing ? (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </motion.button>
                  ) : (
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={handleEditSubmit}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>Save</span>
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: user?.name || '',
                            email: user?.email || '',
                            course: user?.course || '',
                            year: user?.year || '',
                            semester: user?.semester || ''
                          });
                          setErrors({});
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Cancel</span>
                      </motion.button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                        <select
                          value={editForm.course}
                          onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          {courses.map((course) => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                          value={editForm.year}
                          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                        <select
                          value={editForm.semester}
                          onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          {semesters.map((semester) => (
                            <option key={semester} value={semester}>{semester}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-lg text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-lg text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Course</label>
                      <p className="text-lg text-gray-900">{user?.course}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Academic Year</label>
                      <p className="text-lg text-gray-900">{user?.year} • {user?.semester}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 mr-3 text-indigo-600" />
                  Security Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <motion.button
                      onClick={() => setShowPasswordChange(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Change Password
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* App Settings */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BellIcon className="h-6 w-6 mr-3 text-indigo-600" />
                  App Settings
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      key: 'notifications',
                      title: 'Push Notifications',
                      description: 'Receive notifications about new papers and updates',
                      icon: BellIcon
                    },
                    {
                      key: 'emailUpdates',
                      title: 'Email Updates',
                      description: 'Get weekly digest of new papers via email',
                      icon: GlobeAltIcon
                    },
                    {
                      key: 'darkMode',
                      title: 'Dark Mode',
                      description: 'Switch to dark theme for better night reading',
                      icon: settings.darkMode ? MoonIcon : SunIcon
                    },
                    {
                      key: 'publicProfile',
                      title: 'Public Profile',
                      description: 'Allow others to see your study progress',
                      icon: UserCircleIcon
                    }
                  ].map((setting) => {
                    const IconComponent = setting.icon;
                    return (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{setting.title}</h4>
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => setSettings({ ...settings, [setting.key]: !settings[setting.key] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key] ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                            layout
                          />
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordChange && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordChange(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🔐 Change Password
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {[
                  { key: 'currentPassword', label: 'Current Password', type: 'current' },
                  { key: 'newPassword', label: 'New Password', type: 'new' },
                  { key: 'confirmPassword', label: 'Confirm New Password', type: 'confirm' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPasswords[field.type] ? 'text' : 'password'}
                        value={passwordForm[field.key]}
                        onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors[field.key] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, [field.type]: !showPasswords[field.type] })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[field.type] ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors[field.key] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors[field.key]}
                      </p>
                    )}
                  </div>
                ))}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;