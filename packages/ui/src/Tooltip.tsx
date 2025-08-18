import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const tooltipVariants = cva(
  "absolute z-50 px-3 py-1.5 text-sm text-white bg-neutral-800 border border-neutral-700 rounded-md shadow-lg pointer-events-none opacity-0 transition-opacity duration-200",
  {
    variants: {
      side: {
        top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2", 
        left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
        right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      side: "bottom",
      size: "default",
    },
  }
);

interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  side, 
  size, 
  disabled = false,
  delay = 500,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const showTooltip = () => {
    if (disabled) return;
    timeoutId = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <div
        className={cn(
          tooltipVariants({ side, size }),
          isVisible && "opacity-100",
          className
        )}
        role="tooltip"
      >
        {content}
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-2 h-2 bg-neutral-800 border border-neutral-700 transform rotate-45",
            {
              "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0": side === "top",
              "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0": side === "bottom", 
              "left-full top-1/2 -translate-y-1/2 -ml-1 border-t-0 border-l-0": side === "right",
              "right-full top-1/2 -translate-y-1/2 -mr-1 border-b-0 border-r-0": side === "left",
            }
          )}
        />
      </div>
    </div>
  );
};

export { tooltipVariants };
