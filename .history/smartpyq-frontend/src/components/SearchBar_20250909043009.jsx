import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Mock suggestions data - in real app, this would come from API
const mockSuggestions = [
  { id: 1, title: 'Computer Science  - Data Structures', type: 'subject', year: 2023 },
  { id: 2, title: 'Mathematics - Calculus and Differential Equations', type: 'subject', year: 2023 },
  { id: 3, title: 'Physics - Quantum Mechanics', type: 'subject', year: 2022 },
  { id: 4, title: 'Chemistry - Organic Chemistry', type: 'subject', year: 2023 },
  { id: 5, title: 'Electrical  - Circuit Analysis', type: 'subject', year: 2022 },
  { id: 6, title: 'Mechanical Engineering - Thermodynamics', type: 'subject', year: 2023 },
  { id: 7, title: 'Civil Engineering - Structural Analysis', type: 'subject', year: 2022 },
  { id: 8, title: 'Information Technology - Database Management', type: 'subject', year: 2023 }
];

const SearchBar = ({ onSearch, placeholder = "Search for papers, subjects, or universities...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const listboxRef = useRef(null);
  const suggestionRefs = useRef([]);
  
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filtered = mockSuggestions.filter(item =>
          item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 6);
        setSuggestions(filtered);
        setIsLoading(false);
        setIsOpen(filtered.length > 0);
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearch?.(suggestion.title);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e) => {
    // Delay closing to allow suggestion clicks
    setTimeout(() => {
      if (!listboxRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon 
            className="h-5 w-5 text-gray-400" 
            aria-hidden="true"
          />
          <span role="img" aria-label="search" className="ml-2 text-lg">
            🔍
          </span>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-16 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 focus:outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          aria-label="Search for papers"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
        />
        
        {/* Clear button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && !isLoading && (
          <motion.div
            ref={listboxRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                ref={el => suggestionRefs.current[index] = el}
                id={`suggestion-${index}`}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                  index === selectedIndex ? 'bg-brand-50 border-l-4 border-brand-500' : ''
                } ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''} ${index === 0 ? 'rounded-t-lg' : ''}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {suggestion.type} • {suggestion.year}
                    </div>
                  </div>
                  <div className="ml-2 text-gray-400">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      {isOpen && suggestions.length === 0 && !isLoading && debouncedQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="text-center text-gray-500">
            <span role="img" aria-label="no results">🔍</span>
            <p className="mt-1">No results found for "{debouncedQuery}"</p>
            <p className="text-sm mt-1">Try different keywords or check spelling</p>
          </div>
        </motion.div>
      )}

      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {isLoading && 'Searching for papers...'}
        {suggestions.length > 0 && !isLoading && `${suggestions.length} suggestions available`}
        {suggestions.length === 0 && !isLoading && debouncedQuery && 'No suggestions found'}
      </div>
    </div>
  );
};

export default SearchBar;