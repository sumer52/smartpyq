import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
  GitHubIcon
} from '@heroicons/react/24/solid';

const Footer = ({ className = "" }) => {
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Please enter a valid email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Please enter a valid email address.');
      return;
    }

    setSubscriptionStatus('loading');
    setSubscriptionMessage('');

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setSubscriptionStatus('success');
      setSubscriptionMessage('Thank you for subscribing! Check your email for confirmation.');
      setEmail('');
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      // Mock success for demo
      setTimeout(() => {
        setSubscriptionStatus('success');
        setSubscriptionMessage('Thank you for subscribing to our newsletter! 🎉');
        setEmail('');
      }, 1000);
    }

    // Clear status after 5 seconds
    setTimeout(() => {
      setSubscriptionStatus(null);
      setSubscriptionMessage('');
    }, 5000);
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      url: 'https://facebook.com/smartpyq',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      url: 'https://twitter.com/smartpyq',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: InstagramIcon,
      url: 'https://instagram.com/smartpyq',
      color: 'hover:text-pink-600'
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      url: 'https://linkedin.com/company/smartpyq',
      color: 'hover:text-blue-700'
    },
    {
      name: 'YouTube',
      icon: YouTubeIcon,
      url: 'https://youtube.com/@smartpyq',
      color: 'hover:text-red-600'
    },
    {
      name: 'GitHub',
      icon: GitHubIcon,
      url: 'https://github.com/smartpyq',
      color: 'hover:text-gray-900'
    }
  ];

  const quickLinks = [
    { name: 'Browse Papers', to: '/browse' },
    { name: 'Upload Paper', to: '/upload' },
    { name: 'AI Assistant', to: '/ai' },
    { name: 'Search', to: '/search' },
    { name: 'Categories', to: '/categories' },
    { name: 'Recent Papers', to: '/recent' }
  ];

  const supportLinks = [
    { name: 'Help Center', to: '/help' },
    { name: 'Contact Us', to: '/contact' },
    { name: 'FAQ', to: '/faq' },
    { name: 'Privacy Policy', to: '/privacy' },
    { name: 'Terms of Service', to: '/terms' },
    { name: 'Report Issue', to: '/report' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <motion.div
          className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* PYQ Portal - Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="mb-6">
              <Link to="/" className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                  SmartPYQ
                </span>
              </Link>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your intelligent companion for accessing previous year question papers. 
              Empowering students with AI-driven study assistance and comprehensive exam preparation resources.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${social.color} transition-colors p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                <a href="mailto:support@smartpyq.com" className="hover:text-white transition-colors">
                  support@smartpyq.com
                </a>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>123 Education Street, Learning City, LC 12345</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Additional Support Info */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">Need Help?</h4>
              <p className="text-sm text-gray-300 mb-3">
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Contact Support
                <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6 text-white">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest updates, study tips, and new paper releases.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-white placeholder-gray-400 transition-colors"
                  disabled={subscriptionStatus === 'loading'}
                />
              </div>
              
              <motion.button
                type="submit"
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
                  subscriptionStatus === 'loading'
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white'
                }`}
                disabled={subscriptionStatus === 'loading'}
                whileHover={{ scale: subscriptionStatus === 'loading' ? 1 : 1.02 }}
                whileTap={{ scale: subscriptionStatus === 'loading' ? 1 : 0.98 }}
              >
                {subscriptionStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5 inline-block mr-2" />
                    Subscribe
                  </>
                )}
              </motion.button>
            </form>
            
            {/* Subscription Status */}
            {subscriptionStatus && subscriptionMessage && (
              <motion.div
                className={`mt-4 p-3 rounded-lg flex items-start ${
                  subscriptionStatus === 'success'
                    ? 'bg-green-900/50 border border-green-700 text-green-300'
                    : 'bg-red-900/50 border border-red-700 text-red-300'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {subscriptionStatus === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{subscriptionMessage}</span>
              </motion.div>
            )}
            
            {/* Newsletter Benefits */}
            <div className="mt-6 space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                <span>Weekly study tips and strategies</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                <span>New paper notifications</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                <span>Exclusive AI study insights</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" />
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          className="border-t border-gray-800 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>
                © {currentYear} SmartPYQ. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <span>•</span>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <span>Made with</span>
              <motion.div
                className="mx-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <HeartIcon className="h-4 w-4 text-red-500" />
              </motion.div>
              <span>for students worldwide</span>
            </div>
          </div>
          
          {/* Additional Credits */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Empowering education through technology • Serving students since 2024
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-500/5 to-accent-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent-500/5 to-brand-500/5 rounded-full blur-3xl"></div>
      </div>
    </footer>
  );
};

export default Footer;