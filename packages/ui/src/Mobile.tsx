import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

// Mobile-first breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Mobile Stack component - optimized for mobile layouts
const mobileStackVariants = cva("flex flex-col", {
  variants: {
    spacing: {
      none: "space-y-0",
      xs: "space-y-1",
      sm: "space-y-2 sm:space-y-3",
      md: "space-y-3 sm:space-y-4 md:space-y-6",
      lg: "space-y-4 sm:space-y-6 md:space-y-8",
      xl: "space-y-6 sm:space-y-8 md:space-y-12",
    },
    padding: {
      none: "p-0",
      sm: "p-2 sm:p-4",
      md: "p-4 sm:p-6 md:p-8",
      lg: "p-6 sm:p-8 md:p-12",
    },
  },
  defaultVariants: {
    spacing: "md",
    padding: "none",
  },
});

interface MobileStackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileStackVariants> {}

export const MobileStack = React.forwardRef<HTMLDivElement, MobileStackProps>(
  ({ className, spacing, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mobileStackVariants({ spacing, padding }), className)}
      {...props}
    />
  )
);
MobileStack.displayName = "MobileStack";

// Mobile Grid - responsive grid that stacks on mobile
const mobileGridVariants = cva("grid gap-4", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      auto: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2 sm:gap-3",
      md: "gap-3 sm:gap-4 md:gap-6",
      lg: "gap-4 sm:gap-6 md:gap-8",
    },
  },
  defaultVariants: {
    cols: "auto",
    gap: "md",
  },
});

interface MobileGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileGridVariants> {}

export const MobileGrid = React.forwardRef<HTMLDivElement, MobileGridProps>(
  ({ className, cols, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mobileGridVariants({ cols, gap }), className)}
      {...props}
    />
  )
);
MobileGrid.displayName = "MobileGrid";

// Mobile Container - responsive container with mobile-first padding
const mobileContainerVariants = cva(
  "w-full mx-auto",
  {
    variants: {
      size: {
        full: "max-w-none",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "4xl": "max-w-4xl",
        "6xl": "max-w-6xl",
      },
      padding: {
        none: "px-0",
        sm: "px-4 sm:px-6",
        md: "px-4 sm:px-6 lg:px-8",
        lg: "px-6 sm:px-8 lg:px-12",
      },
    },
    defaultVariants: {
      size: "6xl",
      padding: "md",
    },
  }
);

interface MobileContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileContainerVariants> {}

export const MobileContainer = React.forwardRef<HTMLDivElement, MobileContainerProps>(
  ({ className, size, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mobileContainerVariants({ size, padding }), className)}
      {...props}
    />
  )
);
MobileContainer.displayName = "MobileContainer";

// Mobile Card - responsive card component
const mobileCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md",
        flat: "shadow-none border-2",
        elevated: "shadow-md hover:shadow-lg",
      },
      padding: {
        none: "p-0",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
      },
      spacing: {
        compact: "space-y-2 sm:space-y-3",
        comfortable: "space-y-3 sm:space-y-4",
        spacious: "space-y-4 sm:space-y-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      spacing: "comfortable",
    },
  }
);

interface MobileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileCardVariants> {}

export const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, variant, padding, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mobileCardVariants({ variant, padding, spacing }), className)}
      {...props}
    />
  )
);
MobileCard.displayName = "MobileCard";

// Mobile-specific button group
interface MobileButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

export const MobileButtonGroup = React.forwardRef<HTMLDivElement, MobileButtonGroupProps>(
  ({ className, orientation = 'horizontal', fullWidth = false, children, ...props }, ref) => {
    const orientationClasses = orientation === 'vertical' 
      ? 'flex-col space-y-2' 
      : 'flex-row space-x-2 sm:space-x-3';
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientationClasses,
          widthClasses,
          // Stack vertically on mobile for horizontal groups
          orientation === 'horizontal' && 'flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MobileButtonGroup.displayName = "MobileButtonGroup";

// Mobile-optimized flex component
interface MobileFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  mobileDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export const MobileFlex = React.forwardRef<HTMLDivElement, MobileFlexProps>(
  ({ 
    className, 
    direction = 'row',
    mobileDirection = 'col',
    align = 'center',
    justify = 'start',
    gap = 'md',
    wrap = false,
    ...props 
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1 sm:gap-2',
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4',
      lg: 'gap-4 sm:gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[mobileDirection], // Mobile-first direction
          `sm:${directionClasses[direction]}`, // Desktop direction
          alignClasses[align],
          justifyClasses[justify],
          gapClasses[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    );
  }
);
MobileFlex.displayName = "MobileFlex";

// Responsive visibility utilities
export const ShowOnMobile: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="block sm:hidden">{children}</div>
);

export const HideOnMobile: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="hidden sm:block">{children}</div>
);

export const ShowOnTablet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="hidden sm:block lg:hidden">{children}</div>
);

export const ShowOnDesktop: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="hidden lg:block">{children}</div>
);

// Mobile hook for detecting screen size
export function useMobileDetection() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}
