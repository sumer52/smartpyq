import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Lazy load PDF.js - in real implementation, this would be the actual PDF.js library
const LazyPDFRenderer = React.lazy(() => {
  // Simulate loading delay for PDF.js
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: ({ pdfUrl, scale, onLoadSuccess, onLoadError }) => {
          // Mock PDF renderer component
          useEffect(() => {
            const timer = setTimeout(() => {
              if (pdfUrl) {
                onLoadSuccess?.({ numPages: 12 });
              } else {
                onLoadError?.(new Error('Failed to load PDF'));
              }
            }, 1000);
            return () => clearTimeout(timer);
          }, [pdfUrl, onLoadSuccess, onLoadError]);

          return (
            <div 
              className="bg-white shadow-lg mx-auto" 
              style={{ 
                width: `${595 * scale}px`, 
                height: `${842 * scale}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top center'
              }}
            >
              <div className="w-full h-full bg-gray-100 flex items-center justify-center border">
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Sample PDF Document
                  </h3>
                  <p className="text-gray-500 mb-4">
                    This is a mock PDF viewer showing page content.
                  </p>
                  <div className="text-sm text-gray-400">
                    In production, this would render actual PDF content using PDF.js
                  </div>
                </div>
              </div>
            </div>
          );
        }
      });
    }, 500);
  });
});

const PDFViewer = ({ 
  pdfUrl, 
  title = "Document", 
  onClose, 
  onDownload,
  watermark = null,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  // Default watermark with user email and timestamp
  const defaultWatermark = {
    text: watermark?.text || 'user@demo.com',
    timestamp: watermark?.timestamp || new Date().toLocaleString(),
    position: watermark?.position || 'bottom-right'
  };

  // Handle PDF load success
  const handleLoadSuccess = (pdf) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
    setError(null);
  };

  // Handle PDF load error
  const handleLoadError = (error) => {
    setError(error.message || 'Failed to load PDF');
    setIsLoading(false);
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle download with watermark stamping
  const handleDownload = async () => {
    if (!onDownload) return;
    
    setIsDownloading(true);
    try {
      // TODO: In real implementation, call API to stamp watermark and get signed URL
      await onDownload({
        url: pdfUrl,
        title,
        watermark: defaultWatermark
      });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.matches('input, textarea')) return;
      
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose?.();
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleDownload();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getWatermarkPosition = () => {
    switch (defaultWatermark.position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-4 right-4';
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
            {title}
          </h2>
          {numPages > 0 && (
            <span className="text-sm text-gray-500">
              Page {currentPage} of {numPages}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <motion.button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Zoom out"
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </motion.button>
            
            <span className="px-2 py-1 text-sm font-mono text-gray-700 min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <motion.button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              onClick={zoomIn}
              disabled={scale >= 3.0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Zoom in"
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Fullscreen toggle */}
          <motion.button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            onClick={toggleFullscreen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </motion.button>

          {/* Download button */}
          <motion.button
            className="flex items-center px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownload}
            disabled={isDownloading || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Download PDF"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </motion.button>

          {/* Close button */}
          <motion.button
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close PDF viewer"
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-gray-800 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          {/* Loading state */}
          {isLoading && (
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">Loading PDF...</p>
              <p className="text-gray-300">Please wait while we prepare your document</p>
            </motion.div>
          )}

          {/* Error state */}
          {error && (
            <motion.div
              className="text-center text-white max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load PDF</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <motion.button
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-colors"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retry
              </motion.button>
            </motion.div>
          )}

          {/* PDF content */}
          {!isLoading && !error && (
            <div className="relative">
              <Suspense fallback={
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Loading PDF renderer...</p>
                </div>
              }>
                <LazyPDFRenderer
                  pdfUrl={pdfUrl}
                  scale={scale}
                  onLoadSuccess={handleLoadSuccess}
                  onLoadError={handleLoadError}
                />
              </Suspense>

              {/* Watermark overlay */}
              <div className={`absolute ${getWatermarkPosition()} pointer-events-none select-none`}>
                <div className="bg-black/20 backdrop-blur-sm text-white/80 px-3 py-2 rounded-lg text-sm font-mono">
                  <div className="flex flex-col items-end text-right">
                    <div>{defaultWatermark.text}</div>
                    <div className="text-xs opacity-75">{defaultWatermark.timestamp}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <span><kbd className="px-1 bg-gray-700 rounded">+/-</kbd> Zoom</span>
          <span><kbd className="px-1 bg-gray-700 rounded">F</kbd> Fullscreen</span>
          <span><kbd className="px-1 bg-gray-700 rounded">Ctrl+D</kbd> Download</span>
          <span><kbd className="px-1 bg-gray-700 rounded">Esc</kbd> Close</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFViewer;