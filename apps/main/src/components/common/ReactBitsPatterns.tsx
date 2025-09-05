import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Button, Card, CardContent, Typography, Badge } from '@taskflow/ui';

// -----------------------------
// THEME CONTEXT
// -----------------------------
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// -----------------------------
// COMPOUND COMPONENTS PATTERN
// -----------------------------
interface FeatureCardContextType {
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const FeatureCardContext = createContext<FeatureCardContextType | undefined>(undefined);

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> & {
  Icon: React.FC<{ icon: React.ComponentType<any>; color: string }>;
  Title: React.FC<{ children: ReactNode }>;
  Description: React.FC<{ children: ReactNode }>;
} = ({ children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const contextValue = useMemo(() => ({
    isHovered,
    setIsHovered
  }), [isHovered]);

  return (
    <FeatureCardContext.Provider value={contextValue}>
      <Card 
        variant="elevated" 
        className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-8 text-center">
          {children}
        </CardContent>
      </Card>
    </FeatureCardContext.Provider>
  );
};

FeatureCard.Icon = ({ icon: Icon, color }) => {
  const { isHovered } = useContext(FeatureCardContext)!;
  
  return (
    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${color} rounded-3xl shadow-lg transition-transform duration-300 mb-6 ${isHovered ? 'scale-110' : ''}`}>
      <Icon className="w-10 h-10 text-white" />
    </div>
  );
};

FeatureCard.Title = ({ children }) => {
  const { isHovered } = useContext(FeatureCardContext)!;
  
  return (
    <Typography variant="h3" className={`text-xl font-bold mb-4 text-slate-900 transition-colors ${isHovered ? 'text-blue-600' : ''}`}>
      {children}
    </Typography>
  );
};

FeatureCard.Description = ({ children }) => (
  <Typography variant="body" className="text-slate-600 leading-relaxed">
    {children}
  </Typography>
);

// -----------------------------
// RENDER PROPS PATTERN
// -----------------------------
interface DataRendererProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  isLoading?: boolean;
}

export const DataRenderer = <T,>({ 
  data, 
  renderItem, 
  renderEmpty, 
  renderLoading, 
  isLoading = false 
}: DataRendererProps<T>) => {
  if (isLoading) {
    return renderLoading ? renderLoading() : <div>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return renderEmpty ? renderEmpty() : <div>No data available</div>;
  }

  return <>{data.map((item, index) => renderItem(item, index))}</>;
};

// -----------------------------
// CUSTOM HOOKS
// -----------------------------
export const useTestimonials = (totalCount: number = 3) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalCount);
  }, [totalCount]);

  const prev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalCount) % totalCount);
  }, [totalCount]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    currentIndex,
    next,
    prev,
    goTo
  };
};

export const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isIntersecting] as const;
};

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// -----------------------------
// ERROR BOUNDARY
// -----------------------------
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <Typography variant="h4" className="text-red-800">Something went wrong</Typography>
          <Typography variant="body" className="text-red-600">
            {this.state.error?.message}
          </Typography>
        </div>
      );
    }

    return this.props.children;
  }
}

// -----------------------------
// HIGHER-ORDER COMPONENT
// -----------------------------
export const withAnimation = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  animationClass: string = 'animate-fade-in'
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [setRef, isIntersecting] = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    useEffect(() => {
      if (isIntersecting && !isVisible) {
        setIsVisible(true);
      }
    }, [isIntersecting, isVisible]);

    return (
      <div ref={setRef} className={isVisible ? animationClass : 'opacity-0'}>
        <WrappedComponent {...(props as P)} />
      </div>
    );
  });
};

// -----------------------------
// COMPOUND COMPONENT FOR TESTIMONIALS
// -----------------------------
interface TestimonialContextType {
  currentIndex: number;
  totalCount: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

interface TestimonialsProps {
  children: ReactNode;
  totalCount: number;
}

export const Testimonials: React.FC<TestimonialsProps> & {
  Item: React.FC<{ index: number; children: ReactNode }>;
  Navigation: React.FC;
  Indicators: React.FC;
} = ({ children, totalCount }) => {
  const { currentIndex, next, prev, goTo } = useTestimonials(totalCount);

  const contextValue = useMemo(() => ({
    currentIndex,
    totalCount,
    next,
    prev,
    goTo
  }), [currentIndex, totalCount, next, prev, goTo]);

  return (
    <TestimonialContext.Provider value={contextValue}>
      {children}
    </TestimonialContext.Provider>
  );
};

Testimonials.Item = ({ index, children }) => {
  const { currentIndex } = useContext(TestimonialContext)!;
  
  if (index !== currentIndex) return null;
  
  return <>{children}</>;
};

Testimonials.Navigation = () => {
  const { next, prev } = useContext(TestimonialContext)!;
  
  return (
    <div className="flex justify-center space-x-4 mt-8">
      <Button variant="outline" onClick={prev} className="w-12 h-12 p-0">
        ←
      </Button>
      <Button variant="outline" onClick={next} className="w-12 h-12 p-0">
        →
      </Button>
    </div>
  );
};

Testimonials.Indicators = () => {
  const { currentIndex, totalCount, goTo } = useContext(TestimonialContext)!;
  
  return (
    <div className="flex justify-center space-x-2 mt-8">
      {Array.from({ length: totalCount }, (_, index) => (
        <button
          key={index}
          onClick={() => goTo(index)}
          className={`w-3 h-3 rounded-full transition-colors ${
            index === currentIndex ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        />
      ))}
    </div>
  );
};

// -----------------------------
// LAZY LOADING COMPONENT
// -----------------------------
export const LazyComponent: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
}> = ({ children, fallback = <div>Loading...</div>, threshold = 0.1 }) => {
  const [setRef, isIntersecting] = useIntersectionObserver({ threshold });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return (
    <div ref={setRef}>
      {hasLoaded ? children : fallback}
    </div>
  );
};

// -----------------------------
// THEME PROVIDER
// -----------------------------
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useLocalStorage('theme', false);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, [setIsDark]);

  const colors = useMemo(() => ({
    primary: isDark ? '#3B82F6' : '#1E40AF',
    secondary: isDark ? '#8B5CF6' : '#7C3AED',
    accent: isDark ? '#10B981' : '#059669',
    background: isDark ? '#1F2937' : '#FFFFFF',
    text: isDark ? '#F9FAFB' : '#111827'
  }), [isDark]);

  const contextValue = useMemo(() => ({
    isDark,
    toggleTheme,
    colors
  }), [isDark, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// -----------------------------
// MEMOIZED COMPONENTS
// -----------------------------
export const MemoizedFeatureCard = React.memo(FeatureCard);
export const MemoizedDataRenderer = React.memo(DataRenderer) as typeof DataRenderer;

// -----------------------------
// DEMO COMPONENT
// -----------------------------
export const Demo = () => {
  const { toggleTheme } = useTheme();
  
  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        <button onClick={toggleTheme} className="px-4 py-2 bg-blue-600 text-white rounded">
          Toggle Theme
        </button>

        <FeatureCard>
          <FeatureCard.Icon icon={() => <span>⭐</span>} color="from-purple-500 to-blue-600" />
          <FeatureCard.Title>Awesome Feature</FeatureCard.Title>
          <FeatureCard.Description>Compound components with professional patterns</FeatureCard.Description>
        </FeatureCard>

        <DataRenderer 
          data={[1, 2, 3]} 
          renderItem={(n) => <div key={n} className="p-2 bg-gray-100 rounded">{n}</div>} 
        />

        <LazyComponent>
          <div className="p-4 bg-green-100 rounded">I appear when visible</div>
        </LazyComponent>
      </div>
    </ErrorBoundary>
  );
};
  