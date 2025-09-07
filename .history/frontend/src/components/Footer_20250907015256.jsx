import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook,
  Send,
  Lock,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (path, requiresAuth = false) => {
    if (requiresAuth && !isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setEmail('');
      setIsLoading(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }, 1000);
  };

  const quickLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Browse Papers', path: '/browse', locked: false },
        { name: 'Upload Paper', path: '/upload', locked: !isAuthenticated },
        { name: 'AI Assistant', path: '/ai-assistant', locked: !isAuthenticated },
        { name: 'Analytics', path: '/analytics', locked: !isAuthenticated },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help', locked: false },
        { name: 'Contact Us', path: '/contact', locked: false },
        { name: 'Privacy Policy', path: '/privacy', locked: false },
        { name: 'Terms of Service', path: '/terms', locked: false },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Study Tips', path: '/study-tips', locked: false },
        { name: 'Exam Calendar', path: '/calendar', locked: false },
        { name: 'FAQ', path: '/faq', locked: false },
        { name: 'API Documentation', path: '/api-docs', locked: false },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/smartpyq', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/smartpyq', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/smartpyq', color: 'hover:text-pink-500' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/smartpyq', color: 'hover:text-blue-500' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 mb-4"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">SmartPYQ</span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-300 mb-6 max-w-md"
            >
              Your intelligent companion for accessing previous year papers with AI-powered assistance. 
              Streamline your exam preparation with our comprehensive platform.
            </motion.p>
            
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-2 text-sm text-gray-300"
            >
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@smartpyq.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Education District, Learning City</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          {quickLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (sectionIndex + 3) }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavigation(link.path, link.locked)}
                      className={`text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-1 text-sm ${
                        link.locked ? 'cursor-not-allowed opacity-60' : 'hover:underline'
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.locked && <Lock className="w-3 h-3" />}
                      {link.path.startsWith('http') && <ExternalLink className="w-3 h-3" />}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300">
                Get the latest updates on new papers, features, and study tips delivered to your inbox.
              </p>
            </div>
            
            <div>
              {isSubscribed ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-600 text-white p-4 rounded-lg text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span className="font-medium">Successfully subscribed!</span>
                  </div>
                  <p className="text-sm mt-1 text-green-100">Thank you for joining our newsletter.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Subscribing...' : 'Subscribe'}</span>
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </motion.div>

        {/* Social Media & Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          {/* Social Media Links */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm">Follow us:</span>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-gray-400 ${social.color} transition-colors duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              );
            })}
          </div>
          
          {/* Copyright */}
          <div className="text-gray-400 text-sm text-center md:text-right">
            <p>© 2024 SmartPYQ. All rights reserved.</p>
            <p className="mt-1">
              Made with ❤️ for students worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;