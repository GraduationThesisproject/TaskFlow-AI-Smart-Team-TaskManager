import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, ReactNode } from 'react';

// Animation variants for different page types
export const slideVariants = {
  initial: {
    opacity: 0,
    x: -50,
    scale: 0.95
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: 50,
    scale: 0.95
  }
};

export const fadeVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

export const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15
  },
  in: {
    opacity: 1,
    scale: 1,
    rotateY: 0
  },
  out: {
    opacity: 0,
    scale: 1.1,
    rotateY: 15
  }
};

export const pageTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  duration: 0.3
};

// Loading indicator component
export const PageTransitionIndicator = ({ isVisible }: { isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        Loading...
      </motion.div>
    )}
  </AnimatePresence>
);

// Enhanced wrapper component with different animation types
export const AnimatedPage = ({ 
  children, 
  animationType = "slide",
  onAnimationStart,
  onAnimationComplete
}: { 
  children: ReactNode;
  animationType?: "slide" | "fade" | "scale";
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}) => {
  const variants = {
    slide: slideVariants,
    fade: fadeVariants,
    scale: scaleVariants
  }[animationType];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={pageTransition}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      {children}
    </motion.div>
  );
};

// Main PageTransition wrapper component
interface PageTransitionProps {
  children: ReactNode;
  location: any;
  className?: string;
}

export const PageTransition = ({ children, location, className = "" }: PageTransitionProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset transition state when location changes
  useEffect(() => {
    setIsTransitioning(false);
  }, [location.pathname]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }} className={className}>
      <PageTransitionIndicator isVisible={isTransitioning} />
      <AnimatePresence mode="wait" initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing transition state
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleAnimationStart = () => {
    setIsTransitioning(true);
  };

  const handleAnimationComplete = () => {
    setIsTransitioning(false);
  };

  return {
    isTransitioning,
    handleAnimationStart,
    handleAnimationComplete
  };
};
