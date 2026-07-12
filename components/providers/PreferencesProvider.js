'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState('id');
  const [currency, setCurrency] = useState('IDR');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const savedLanguage = localStorage.getItem('language') || 'id';
    const savedCurrency = localStorage.getItem('currency') || 'IDR';
    
    setLanguage(savedLanguage);
    setCurrency(savedCurrency);

    // Listen for storage changes (when updated from Settings)
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('language') || 'id';
      const newCurrency = localStorage.getItem('currency') || 'IDR';
      
      setLanguage(newLanguage);
      setCurrency(newCurrency);
      setUpdateTrigger(prev => prev + 1); // Force re-render
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('preferencesChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('preferencesChanged', handleStorageChange);
    };
  }, []);

  return (
    <PreferencesContext.Provider value={{ language, currency, setLanguage, setCurrency, updateTrigger }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
