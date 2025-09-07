import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const QuickActions = ({ className = "" }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'upload',
      title: 'Upload Paper',
      description: 'Share question papers with the community',
      emoji: '📝',
      emojiLabel: 'memo',
      icon: CloudArrowUpIcon,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      action: () => navigate('/upload'),
      shortcut: 'U'
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      description: 'Get instant help with your studies',
      emoji: '🤖',
      emojiLabel: 'robot',
      icon: ChatBubbleLeftRightIcon,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      action: () => navigate('/ai'),
      shortcut: 'A'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View trends and insights',
      emoji: '📊',
      emojiLabel: 'bar chart',
      icon: ChartBarIcon,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      action: () => navigate('/analytics'),
      shortcut: 'T'
    },
    {
      id: 'browse',
      title: 'Browse Papers',
      description: 'Explore our vast collection',
      emoji: '🔍',
      emojiLabel: 'magnifying glass',
      icon: MagnifyingGlassIcon,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      action: () => navigate('/browse'),
      shortcut: 'B'
    }
  ];

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if no input is focused and Ctrl/Cmd is pressed
      if ((e.ctrlKey || e.metaKey) && !e.target.matches('input, textarea, [contenteditable]')) {
        const action = actions.find(a => a.shortcut.toLowerCase() === e.key.toLowerCase());
        if (action) {
          e.preventDefault();
          action.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      scale: 0.98,
      y: 0
    }
  };

  return (
    <section className={`py-8 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Quick Actions
          </h2>
          <p className="text-gray-600">
            Jump straight to what you need
          </p>
        </motion.div>

        {/* Actions grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {actions.map((action) => {
            const IconComponent = action.icon;
            
            return (
              <motion.button
                key={action.id}
                className={`group relative p-6 bg-white rounded-xl border-2 ${action.borderColor} hover:border-${action.color}-300 ${action.bgColor} hover:bg-${action.color}-100 transition-all duration-200 text-left focus:outline-none focus:ring-4 focus:ring-${action.color}-500/30 overflow-hidden`}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                {...buttonVariants}
                onClick={action.action}
                aria-label={`${action.title}: ${action.description}`}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-500/5 to-${action.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and emoji */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        <span role="img" aria-label={action.emojiLabel}>
                          {action.emoji}
                        </span>
                      </div>
                      <IconComponent className={`h-6 w-6 ${action.textColor}`} />
                    </div>
                    
                    {/* Keyboard shortcut */}
                    <div className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded group-hover:bg-white group-hover:text-gray-600 transition-colors">
                      ⌘{action.shortcut}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`font-semibold ${action.textColor} mb-2 group-hover:text-${action.color}-800 transition-colors`}>
                    {action.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    {action.description}
                  </p>

                  {/* Action arrow */}
                  <div className="mt-4 flex items-center justify-end">
                    <motion.div
                      className={`text-${action.color}-400 group-hover:text-${action.color}-600 transition-colors`}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                  }}
                />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Keyboard shortcuts help */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-500">
            <span role="img" aria-label="keyboard">⌨️</span>
            {' '}Tip: Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Cmd/Ctrl + Key</kbd> for quick access
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default QuickActions;