import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

const dropdownTriggerVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        subtle: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        // Special variant for when using Button as trigger to avoid double hover
        button: "",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

const dropdownContentVariants = cva(
  "absolute z-50 min-w-[200px] w-full rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      side: {
        bottom: "top-full mt-2",
        top: "bottom-full mb-2",
        left: "right-full mr-2",
        right: "left-full ml-2",
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
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2.5 text-sm outline-none transition-all duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "",
        destructive: "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive",
        success: "text-green-600 hover:bg-green-50 hover:text-green-900 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-50",
        warning: "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950 dark:hover:text-yellow-50",
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
  showChevron?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  showChevron = true,
  disabled = false,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = (newState: boolean) => {
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  // Check if trigger is a Button component to avoid double hover effects
  const isButtonTrigger = React.isValidElement(trigger) && 
    (trigger.type === 'button' || 
     (React.isValidElement(trigger) && trigger.props.className && trigger.props.className.includes('Button')));

  // If trigger is a Button, wrap it to handle the dropdown functionality
  if (isButtonTrigger) {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          handleToggle(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleToggle(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

    return (
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Clone the trigger and add dropdown functionality without DOM nesting */}
        {React.cloneElement(trigger as React.ReactElement, {
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              handleToggle(!isOpen);
            }
            // Call original onClick if it exists
            if (trigger.props.onClick) {
              trigger.props.onClick(e);
            }
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled) {
                handleToggle(!isOpen);
              }
            }
            // Call original onKeyDown if it exists
            if (trigger.props.onKeyDown) {
              trigger.props.onKeyDown(e);
            }
          },
          'aria-haspopup': 'true',
          'aria-expanded': isOpen,
          disabled: disabled,
        })}
        
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
              side === 'left' ? 'right-full mr-2' : side === 'right' ? 'left-full ml-2' : '',
              contentClassName
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

      useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          handleToggle(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleToggle(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        handleToggle(!isOpen);
      }
    }
  };

  // Check if the trigger is a Button component to avoid nested buttons
  const isButtonTrigger2 = React.isValidElement(trigger) && (
    trigger.type === 'button' || 
    (typeof trigger.type === 'function' && (trigger.type as any).displayName === 'Button')
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className={cn(
          dropdownTriggerVariants({ variant: isButtonTrigger2 ? 'button' : variant, size }), 
          className,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && handleToggle(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
        type="button"
      >
        {trigger}
        {showChevron && (
          <div className="flex items-center">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            )}
          </div>
        )}
      </button>

      {isOpen && (
        <div 
          className={cn(dropdownContentVariants({ side, align }), contentClassName)}
          data-side={side}
          style={{
            animationDuration: '150ms',
          }}
        >
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
  icon?: React.ReactNode;
  shortcut?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  variant,
  className,
  icon,
  shortcut,
}) => (
  <button
    type="button"
    className={cn(dropdownItemVariants({ variant }), className)}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    role="menuitem"
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    <span className="flex-1 text-left">{children}</span>
    {shortcut && (
      <span className="ml-auto text-xs text-muted-foreground font-mono">
        {shortcut}
      </span>
    )}
  </button>
);

export const DropdownSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("my-1.5 h-px bg-border/50", className)} role="separator" />
);

export const DropdownLabel: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, className, icon }) => (
  <div className={cn("flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)}>
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children}
  </div>
);

export const DropdownGroup: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("space-y-0.5", className)}>
    {children}
  </div>
);

export {
  dropdownTriggerVariants,
  dropdownContentVariants,
  dropdownItemVariants,
};
