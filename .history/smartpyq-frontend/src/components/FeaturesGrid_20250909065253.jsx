import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FeaturesGrid = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Previous Year Papers',
      description: 'Access thousands of previous year question papers.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4v15"/><path d="M8 4v15"/><path d="M16 4v15"/><path d="M20 4v15"/></svg>
      ),
      gradient: 'from-brand-500/10 to-brand-600/10',
      borderColor: 'border-brand-200',
      hoverBorderColor: 'hover:border-brand-400',
      textColor: 'text-brand-700',
      bgHover: 'hover:bg-brand-50',
      action: () => navigate('/browse'),
      stats: '10,000+ Papers'
    },
    {
      id: 2,
      title: 'AI Study Assistant',
      description: 'Get personalized study recommendations and instant answers to your academic questions.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a21caf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/><rect x="7" y="16" width="10" height="4" rx="2"/><path d="M12 2v2"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/></svg>
      ),
      gradient: 'from-accent-500/10 to-accent-600/10',
      borderColor: 'border-accent-200',
      hoverBorderColor: 'hover:border-accent-400',
      textColor: 'text-accent-700',
      bgHover: 'hover:bg-accent-50',
      action: () => navigate('/ai'),
      stats: '24/7 Available'
    },
    {
      id: 3,
      title: 'Predictive Analysis',
      description: 'Smart analytics to predict important topics and questions for your upcoming exams.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      ),
      gradient: 'from-success-500/10 to-success-600/10',
      borderColor: 'border-success-200',
      hoverBorderColor: 'hover:border-success-400',
      textColor: 'text-success-700',
      bgHover: 'hover:bg-success-50',
      action: () => navigate('/analytics'),
      stats: '95% Accuracy'
    },
    {
      id: 4,
      title: 'Offline Access',
      description: 'Download papers for offline study. Access your materials anytime, anywhere.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ),
      gradient: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-200',
      hoverBorderColor: 'hover:border-orange-400',
      textColor: 'text-orange-700',
      bgHover: 'hover:bg-orange-50',
      action: () => navigate('/download'),
      stats: 'Unlimited Downloads'
    }
  ];

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

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -6,
      scale: 1.02,
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

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools and resources designed to boost your academic performance
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className={`group relative bg-white rounded-2xl border-2 ${feature.borderColor} ${feature.hoverBorderColor} ${feature.bgHover} transition-all duration-300 cursor-pointer overflow-hidden`}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              {...cardHoverVariants}
              onClick={feature.action}
              role="button"
              tabIndex={0}
              aria-label={`Learn more about ${feature.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  feature.action();
                }
              }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Card content */}
              <div className="relative p-6 h-full flex flex-col">
                {/* Icon and stats */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center mb-2 rounded-xl bg-gray-100 border border-gray-300">
                    {feature.icon}
                  </div>
                  <div className={`text-sm font-medium ${feature.textColor} bg-white/80 px-2 py-1 rounded-full`}>
                    {feature.stats}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed flex-grow group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>

                {/* Action indicator */}
                <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                  <span>Explore</span>
                  <motion.svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </div>
              </div>

              {/* Hover effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-600 mb-6">
            Ready to transform your study experience?
          </p>
          <motion.button
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-lg hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
          >
            <span role="img" aria-label="sparkles" className="mr-2">✨</span>
            Get Started Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;