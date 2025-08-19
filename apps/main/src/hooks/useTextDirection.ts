import { useState, useEffect, useCallback } from 'react';

export type TextDirection = 'ltr' | 'rtl';

export interface UseTextDirectionOptions {
  initialDirection?: TextDirection;
  autoDetect?: boolean;
  persistToStorage?: boolean;
  storageKey?: string;
}

export interface TextDirectionState {
  direction: TextDirection;
  isRTL: boolean;
  isLTR: boolean;
  setDirection: (direction: TextDirection) => void;
  toggleDirection: () => void;
  getTextAlign: () => 'left' | 'right';
  getFlexDirection: () => 'row' | 'row-reverse';
  getMarginStart: (value: string) => string;
  getMarginEnd: (value: string) => string;
  getPaddingStart: (value: string) => string;
  getPaddingEnd: (value: string) => string;
}

export function useTextDirection(options: UseTextDirectionOptions = {}): TextDirectionState {
  const {
    initialDirection = 'ltr',
    autoDetect = true,
    persistToStorage = true,
    storageKey = 'text-direction'
  } = options;

  const [direction, setDirectionState] = useState<TextDirection>(() => {
    // Try to get from localStorage first
    if (persistToStorage && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'ltr' || stored === 'rtl') {
        return stored;
      }
    }
    return initialDirection;
  });

  // Auto-detect RTL languages
  useEffect(() => {
    if (autoDetect && typeof window !== 'undefined') {
      const detectRTL = () => {
        const htmlLang = document.documentElement.lang.toLowerCase();
        const rtlLanguages = [
          'ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ku', 'dv', 'ckb'
        ];
        
        if (rtlLanguages.includes(htmlLang)) {
          setDirectionState('rtl');
        }
      };

      detectRTL();
    }
  }, [autoDetect]);

  // Update document direction when direction changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.setAttribute('data-text-direction', direction);
    }
  }, [direction]);

  // Persist to localStorage
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, direction);
    }
  }, [direction, persistToStorage, storageKey]);

  const setDirection = useCallback((newDirection: TextDirection) => {
    setDirectionState(newDirection);
  }, []);

  const toggleDirection = useCallback(() => {
    setDirectionState(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  }, []);

  const getTextAlign = useCallback(() => {
    return direction === 'rtl' ? 'right' : 'left';
  }, [direction]);

  const getFlexDirection = useCallback(() => {
    return direction === 'rtl' ? 'row-reverse' : 'row';
  }, [direction]);

  const getMarginStart = useCallback((value: string) => {
    return direction === 'rtl' ? `margin-right: ${value}` : `margin-left: ${value}`;
  }, [direction]);

  const getMarginEnd = useCallback((value: string) => {
    return direction === 'rtl' ? `margin-left: ${value}` : `margin-right: ${value}`;
  }, [direction]);

  const getPaddingStart = useCallback((value: string) => {
    return direction === 'rtl' ? `padding-right: ${value}` : `padding-left: ${value}`;
  }, [direction]);

  const getPaddingEnd = useCallback((value: string) => {
    return direction === 'rtl' ? `padding-left: ${value}` : `padding-right: ${value}`;
  }, [direction]);

  return {
    direction,
    isRTL: direction === 'rtl',
    isLTR: direction === 'ltr',
    setDirection,
    toggleDirection,
    getTextAlign,
    getFlexDirection,
    getMarginStart,
    getMarginEnd,
    getPaddingStart,
    getPaddingEnd,
  };
}

// Utility function to check if a language is RTL
export function isRTLLanguage(language: string): boolean {
  const rtlLanguages = [
    'ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ku', 'dv', 'ckb'
  ];
  return rtlLanguages.includes(language.toLowerCase());
}

// Utility function to get text direction for a specific language
export function getTextDirectionForLanguage(language: string): TextDirection {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
}
