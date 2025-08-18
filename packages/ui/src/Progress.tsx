import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const progressBarVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        accent: "bg-accent",
        gradient: "bg-gradient-to-r from-primary to-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size, 
    variant = "default", 
    showValue = false,
    formatValue,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const defaultFormatValue = (val: number, maxVal: number) => 
      `${Math.round((val / maxVal) * 100)}%`;

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className={cn(progressVariants({ size }))}>
          <div
            className={cn(progressBarVariants({ variant }))}
            style={{
              transform: `translateX(-${100 - percentage}%)`,
            }}
          />
        </div>
        {showValue && (
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatValue ? formatValue(value, max) : defaultFormatValue(value, max)}</span>
            <span>{value}/{max}</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress, progressVariants, progressBarVariants };
