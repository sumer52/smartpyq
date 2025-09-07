import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 via-accent-500/3 to-transparent" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          variants={itemVariants}
        >
          <span role="img" aria-label="books">📚</span> Unlock Previous Year Papers
          <br />
          with <span role="img" aria-label="sparkles">✨</span>{' '}
          <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            SmartPYQ
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Access thousands of previous year question papers, get AI-powered study assistance, 
          and boost your exam preparation with intelligent insights.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-500/30 min-w-[200px]"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/browse')}
            aria-label="Start browsing previous year papers"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span role="img" aria-label="search">🔍</span>
              Browse Papers
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-700 to-brand-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>

          <motion.button
            className="group px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl border-2 border-brand-200 hover:border-brand-300 hover:bg-brand-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-500/30 min-w-[200px]"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/ai')}
            aria-label="Try AI study assistant"
          >
            <span className="flex items-center justify-center gap-2">
              <span role="img" aria-label="robot">🤖</span>
              Try AI Assistant
            </span>
          </motion.button>
        </motion.div>

        {/* Stats or features preview */}
        <motion.div
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-600 mb-2">10,000+</div>
            <div className="text-gray-600">Question Papers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-600 mb-2">500+</div>
            <div className="text-gray-600">Universities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-600 mb-2">24/7</div>
            <div className="text-gray-600">AI Support</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;