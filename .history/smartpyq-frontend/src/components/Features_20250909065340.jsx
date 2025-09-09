import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Bot, TrendingUp, Download, Zap, Shield, Clock, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      id: 1,
      title: 'Previous Year Papers',
      description: 'Access thousands of authentic question papers from top universities across India with detailed solutions and marking schemes.',
      icon: FileText,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      iconBg: 'bg-blue-100',
      stats: '12K+ Papers'
    },
    {
      id: 2,
      title: 'AI Study Assistant',
      description: 'Get personalized study recommendations, instant doubt resolution, and smart explanations powered by advanced AI technology.',
      icon: Bot,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      iconBg: 'bg-purple-100',
      stats: '24/7 Available'
    },
    {
      id: 3,
      title: 'Predictive Analysis',
      description: 'Advanced analytics to predict important topics, question patterns, and exam trends based on historical data .',
      icon: TrendingUp,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      iconBg: 'bg-green-100',
      stats: '98% Accuracy'
    },
    {
      id: 4,
      title: 'Offline Access',
      description: 'Download papers and study materials for offline access. Perfect for studying anywhere, anytime without internet.',
      icon: Download,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      iconBg: 'bg-orange-100',
      stats: 'Unlimited Downloads'
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for quick access'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: Clock,
      title: 'Regular Updates',
      description: 'Fresh content added weekly from latest exams'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with fellow students and mentors'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -8,
      scale: 1.03,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
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
            Powerful{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to excel in your exams, powered by cutting-edge technology and comprehensive content
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                className={`relative p-8 rounded-2xl ${feature.bgColor} ${feature.hoverColor} border border-gray-200 group cursor-pointer overflow-hidden transition-all duration-300`}
                variants={cardVariants}
                whileHover="hover"
                {...hoverVariants}
              >
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow duration-300`}
                    variants={iconVariants}
                  >
                    <IconComponent className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                  </motion.div>
                  
                  {/* Stats Badge */}
                  <div className={`inline-block px-3 py-1 bg-gradient-to-r ${feature.color} text-white text-xs font-semibold rounded-full mb-4 opacity-90`}>
                    {feature.stats}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative Elements */}
                <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-5 rounded-full group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br ${feature.color} opacity-5 rounded-full group-hover:opacity-10 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Features */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {additionalFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -4 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-shadow duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <IconComponent className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-gray-600 mb-8 text-lg">
            Ready to experience the future of exam preparation?
          </p>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;