import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BrowseByStream = () => {
  const navigate = useNavigate();

  const streams = [
    {
      id: 'bsc-mscs',
      title: 'BSc MSCS',
      subtitle: 'Mathematics & Computer Science',
      icon: '💻',
      count: '2,450+',
      color: 'from-blue-400 to-purple-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      
    },
    {
      id: 'bsc-msds',
      title: 'BSc MSDS',
      subtitle: 'Mathematics & Data Science',
      icon: '📊',
      count: '1,890+',
      color: 'from-green-400 to-blue-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    
    },
    {
      id: 'bsc-life-sciences',
      title: 'BSc Life Sciences',
      subtitle: 'Biology & Life Sciences',
      icon: '🧬',
      count: '1,650+',
      color: 'from-emerald-400 to-teal-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
      
    },
    {
      id: 'bcom-general',
      title: 'BCom General',
      subtitle: 'Commerce & Business',
      icon: '💼',
      count: '4,560+',
      color: 'from-teal-400 to-cyan-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100',
  
    },
    {
      id: 'bca',
      title: 'BCA',
      subtitle: 'Computer Applications',
      icon: '🖥️',
      count: '3,120+',
      color: 'from-purple-400 to-pink-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      
    },
    {
      id: 'bba',
      title: 'BBA',
      subtitle: 'Business Administration',
      icon: '📈',
      count: '2,780+',
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      languages: ['Hindi', 'English', 'Telugu']
    },
   
   
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            🎓 Browse by{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stream
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your academic stream and access thousands of previous year question papers 
            tailored to your degree program
          </p>
        </motion.div>

        {/* Stream Cards Grid */}
        <motion.div
          className="grid grid-cols-3 grid-rows-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {streams.map((stream) => (
            <motion.div
              key={stream.id}
              className={`relative p-6 rounded-2xl ${stream.bgColor} ${stream.hoverColor} border border-gray-200 cursor-pointer group transition-all duration-300`}
              variants={cardVariants}
              whileHover="hover"
              onClick={() => navigate(`/browse?stream=${stream.id}`)}
              {...cardHoverVariants}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stream.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Icon */}
                <motion.div
                  className="text-4xl mb-4 inline-block"
                  variants={iconVariants}
                >
                  {stream.icon}
                </motion.div>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                  {stream.title}
                </h3>
                
                {/* Subtitle */}
                {stream.subtitle && (
                  <p className="text-xs text-gray-500 mb-3 group-hover:text-gray-600 transition-colors">
                    {stream.subtitle}
                  </p>
                )}
                
                {/* Count */}
                <div className={`text-2xl font-bold bg-gradient-to-r ${stream.color} bg-clip-text text-transparent mb-1`}>
                  {stream.count}
                </div>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mb-2">
                  Papers Available
                </p>
                
                {/* Languages */}
                {stream.languages && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {stream.languages.map((lang, index) => (
                      <span 
                        key={lang}
                        className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full text-gray-600 group-hover:bg-opacity-80 transition-all"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stream.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-gray-600 mb-6">
            Don't see your stream? We're constantly adding new programs!
          </p>
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/contact')}
          >
            Request New Stream
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default BrowseByStream;