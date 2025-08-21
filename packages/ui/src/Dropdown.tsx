import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const dropdownTriggerVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

const dropdownContentVariants = cva(
  "absolute z-50 min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
  {
    variants: {
      side: {
        bottom: "top-full mt-1",
        top: "bottom-full mb-1",
        left: "right-full mr-1",
        right: "left-full ml-1",
      },
      align: {
        start: "left-0",
        center: "left-1/2 transform -translate-x-1/2",
        end: "right-0",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "start",
    },
  }
);

const dropdownItemVariants = cva(
  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive: "text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface DropdownProps extends VariantProps<typeof dropdownTriggerVariants> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: VariantProps<typeof dropdownContentVariants>['side'];
  align?: VariantProps<typeof dropdownContentVariants>['align'];
  className?: string;
  contentClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  variant,
  size,
  side,
  align,
  className,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className={cn(dropdownTriggerVariants({ variant, size }), className)}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        <svg
          className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={cn(dropdownContentVariants({ side, align }), contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps extends VariantProps<typeof dropdownItemVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  variant,
  className,
}) => (
  <div
    className={cn(dropdownItemVariants({ variant }), className)}
    onClick={disabled ? undefined : onClick}
    data-disabled={disabled}
    role="menuitem"
    tabIndex={disabled ? -1 : 0}
  >
    {children}
  </div>
);

export const DropdownSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("my-1 h-px bg-border", className)} role="separator" />
);

export const DropdownLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold text-muted-foreground", className)}>
    {children}
  </div>
);

export {
  dropdownTriggerVariants,
  dropdownContentVariants,
  dropdownItemVariants,
};
