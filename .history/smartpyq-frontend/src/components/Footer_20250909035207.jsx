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
// Social media icons - using simple SVG since Heroicons doesn't have branded icons
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.036.388a3.9 3.9 0 00-1.423.923A3.9 3.9 0 00.388 5.036c-.184.484-.306 1.058-.34 2.005C.013 7.989 0 8.396 0 12.017s.013 4.028.048 4.976c.034.947.156 1.521.34 2.005a3.9 3.9 0 00.923 1.423 3.9 3.9 0 001.423.923c.484.184 1.058.306 2.005.34.948.035 1.355.048 4.976.048s4.028-.013 4.976-.048c.947-.034 1.521-.156 2.005-.34a3.9 3.9 0 001.423-.923 3.9 3.9 0 00.923-1.423c.184-.484.306-1.058.34-2.005.035-.948.048-1.355.048-4.976s-.013-4.028-.048-4.976c-.034-.947-.156-1.521-.34-2.005a3.9 3.9 0 00-.923-1.423A3.9 3.9 0 0018.982.388c-.484-.184-1.058-.306-2.005-.34C16.029.013 15.622 0 12.017 0zm0 2.162c3.204 0 3.584.012 4.85.07.3.012.611.054.918.114.469.181.823.398 1.15.748.35.35.566.681.748 1.15.137.459.198.918.114.918.07 1.266.07 4.85 0 3.584-.012 4.85-.07.3-.012.611-.054.918-.114.469-.181.823-.398 1.15-.748.35-.35.566-.681.748-1.15.137-.459.198-.918.114-.918-.07-1.266-.07-4.85 0-3.584.012-4.85.07-.3.012-.611.054-.918.114-.469.181-.823.398-1.15.748-.35.35-.566.681-.748 1.15-.137.459-.198.918-.114.918.07 1.266.07 4.85 0 3.584-.012 4.85-.07zm-1.85 9.97a2.8 2.8 0 110-5.6 2.8 2.8 0 010 5.6zm0-7.425a4.625 4.625 0 100 9.25 4.625 4.625 0 000-9.25zm5.228-.267a1.08 1.08 0 11-2.16 0 1.08 1.08 0 012.16 0z" clipRule="evenodd" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" clipRule="evenodd" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

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
    { name: 'Contact Us', to: '/contact' },
    { name: 'FAQ', to: '/faq' },
    { name: 'Privacy Policy', to: '/privacy' },
    { name: 'Terms of Service', to: '/terms' },
    { name: 'Report Issue', to: '/report-issue' }
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
                <a href="mailto:smartpyq@gmail.com" className="hover:text-white transition-colors">
                  smartpyq@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                <a href="tel:+910000000000" className="hover:text-white transition-colors">
                  +91 00000 00000
                </a>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Hyderabad, Telangana</span>
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