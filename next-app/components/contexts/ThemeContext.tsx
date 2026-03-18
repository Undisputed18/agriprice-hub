// @/components/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null); // Changed from undefined to null

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('ThemeProvider mounted'); // Debug log
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('ThemeProvider useEffect running');
    setMounted(true);
    const saved = localStorage.getItem('theme-mode');
    if (saved !== null) {
      setIsDarkMode(saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    console.log('Theme updated:', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  // Add debugging
  if (typeof window !== 'undefined') {
    console.log('useTheme called, context:', context ? 'found' : 'null');
  }
  
  if (!context) {
    console.error('useTheme must be used within a ThemeProvider');
    // Return default values instead of throwing
    return {
      isDarkMode: false,
      toggleDarkMode: () => console.warn('toggleDarkMode called without ThemeProvider'),
    };
  }
  
  return context;
};