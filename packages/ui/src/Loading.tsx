import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-primary",
      secondary: "text-muted-foreground",
      white: "text-white",
      accent: "text-accent",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

const loadingContainerVariants = cva("flex items-center justify-center", {
  variants: {
    fullScreen: {
      true: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      false: "",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      default: "p-8",
      lg: "p-12",
    },
  },
  defaultVariants: {
    fullScreen: false,
    padding: "default",
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size, variant, className }) => (
  <svg
    className={cn(spinnerVariants({ size, variant }), className)}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

interface DotsProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export const Dots: React.FC<DotsProps> = ({ size, variant, className }) => (
  <div className={cn("flex space-x-1", className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          "rounded-full animate-bounce",
          spinnerVariants({ size, variant }),
          size === "xs" ? "h-1 w-1" : 
          size === "sm" ? "h-1.5 w-1.5" :
          size === "default" ? "h-2 w-2" :
          size === "lg" ? "h-3 w-3" :
          "h-4 w-4"
        )}
        style={{
          backgroundColor: "currentColor",
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

interface ProgressRingProps extends VariantProps<typeof spinnerVariants> {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size, 
  variant, 
  className,
  showPercentage = false 
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <svg
        className={cn(spinnerVariants({ size, variant }), "transform -rotate-90")}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="opacity-25"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

interface LoadingProps extends VariantProps<typeof loadingContainerVariants> {
  children?: React.ReactNode;
  text?: string;
  type?: 'spinner' | 'dots' | 'progress';
  progress?: number;
  spinnerProps?: SpinnerProps;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  children,
  text,
  type = 'spinner',
  progress = 0,
  fullScreen,
  padding,
  spinnerProps = {},
  className,
}) => {
  const LoadingComponent = () => {
    switch (type) {
      case 'dots':
        return <Dots {...spinnerProps} />;
      case 'progress':
        return <ProgressRing progress={progress} showPercentage {...spinnerProps} />;
      default:
        return <Spinner {...spinnerProps} />;
    }
  };

  return (
    <div className={cn(loadingContainerVariants({ fullScreen, padding }), className)}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingComponent />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
        {children}
      </div>
    </div>
  );
};

// Loading overlay component for wrapping content
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingProps?: LoadingProps;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  loadingProps = {},
  className,
}) => (
  <div className={cn("relative", className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <Loading {...loadingProps} />
      </div>
    )}
  </div>
);

export {
  spinnerVariants,
  loadingContainerVariants,
};
