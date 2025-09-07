import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AIPage = lazy(() => import('./pages/AIPage'));

// Loading component with skeleton
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
      <p className="text-muted-500">Loading...</p>
    </div>
  </div>
);

// Skip link for accessibility
const SkipLink = () => (
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
);

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

function App() {
  return (
    <div className="App min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Test rendering */}
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold text-brand-600 mb-4">SmartPYQ Test</h1>
        <p className="text-gray-600">If you can see this, React is working!</p>
      </div>
      
      <SkipLink />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <HomePage />
                  </motion.div>
                } 
              />
              <Route 
                path="/browse" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <BrowsePage />
                  </motion.div>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <UploadPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/ai" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AIPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
                        <p className="text-gray-600">Coming Soon - Track your study progress and insights</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/download" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Download Center</h1>
                        <p className="text-gray-600">Coming Soon - Access your downloaded papers</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Search</h1>
                        <p className="text-gray-600">Coming Soon - Advanced search functionality</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/categories" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories</h1>
                        <p className="text-gray-600">Coming Soon - Browse papers by category</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/recent" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Recent Papers</h1>
                        <p className="text-gray-600">Coming Soon - Latest uploaded papers</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
                        <p className="text-gray-600">Coming Soon - Get help and support</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                        <p className="text-gray-600">Coming Soon - Get in touch with our team</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/faq" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
                        <p className="text-gray-600">Coming Soon - Find answers to common questions</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/privacy" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                        <p className="text-gray-600">Coming Soon - Our privacy policy and data protection</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/terms" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                        <p className="text-gray-600">Coming Soon - Terms and conditions</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
              <Route 
                path="/report" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Report Issue</h1>
                        <p className="text-gray-600">Coming Soon - Report problems or issues</p>
                      </div>
                    </div>
                  </motion.div>
                } 
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Chat Widget */}
      <ChatWidget />
      
      {/* Live Region for Screen Readers */}
      <div 
        id="live-region" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      ></div>
    </div>
  );
}

export default App;