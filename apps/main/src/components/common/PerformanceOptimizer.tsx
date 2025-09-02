import React, { Suspense, lazy, memo, useMemo, useCallback, useEffect, useState } from 'react';
import type { LazyComponentProps, ErrorBoundaryProps, ErrorBoundaryState } from '../../types/interfaces/ui';

export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div>Loading...</div>
) {
  const LazyComponent = lazy(importFunc);
  
  const WrappedComponent = React.forwardRef<React.ComponentRef<T>, React.ComponentProps<T> & LazyComponentProps>(
    ({ fallback: customFallback, errorFallback, ...props }, ref) => {
      const [hasError, setHasError] = useState(false);
      
      if (hasError && errorFallback) {
        return <>{errorFallback}</>;
      }
      
      return (
        <ErrorBoundary onError={() => setHasError(true)}>
          <Suspense fallback={customFallback || fallback}>
            <LazyComponent {...props} ref={ref} />
          </Suspense>
        </ErrorBoundary>
      );
    }
  );
  
  WrappedComponent.displayName = 'LazyComponent';
  return WrappedComponent;
}
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <p className="text-destructive">Something went wrong.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: useCallback((event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }, [])
  };
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: globalThis.IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return { ref: setRef, isIntersecting };
}

// Debounced hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Throttled hook
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = React.useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, delay - (Date.now() - lastRun.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return throttledValue;
}

// Memoized component wrapper
export function withMemo<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (_prevProps: React.ComponentProps<T>, _nextProps: React.ComponentProps<T>) => boolean
) {
  return memo(Component, propsAreEqual);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // Longer than one frame (16ms)
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  });
}

// Image lazy loading component
import type { LazyImageProps } from '../../types/interfaces/ui';

export const LazyImage = memo<LazyImageProps>(({
  src,
  alt,
  className,
  placeholder,
  onLoad,
  onError
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '50px'
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);
  
  return (
    <div ref={ref} className={className}>
      {isIntersecting && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {!isLoaded && placeholder && (
        <div 
          className="bg-muted animate-pulse"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      {hasError && (
        <div className="bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

// Infinite scroll hook
export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  loading: boolean
) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: '100px'
  });
  
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);
  
  return { ref };
}

// Optimized list component
import type { OptimizedListProps } from '../../types/interfaces/ui';

export function OptimizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className
}: OptimizedListProps<T>) {
  const { visibleItems, totalHeight, offsetY, onScroll } = useVirtualScroll(
    items,
    itemHeight,
    containerHeight
  );
  
  return (
    <div
      className={`overflow-auto ${className || ''}`}
      style={{ height: containerHeight }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index + Math.floor(offsetY / itemHeight))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
