import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-colors",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4", 
        lg: "h-5 w-5",
      },
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        accent: "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
        success: "data-[state=checked]:bg-success data-[state=checked]:border-success",
        warning: "data-[state=checked]:bg-warning data-[state=checked]:border-warning",
        error: "data-[state=checked]:bg-error data-[state=checked]:border-error",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, variant, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(checkboxVariants({ size, variant }), className)}
            data-state={props.checked ? "checked" : "unchecked"}
            {...props}
          />
          
          {/* Check icon */}
          {props.checked && (
            <svg
              className={cn(
                "absolute inset-0 m-auto pointer-events-none text-current",
                size === "sm" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5"
              )}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708L6.5 11.707 2.146 7.354a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          )}
        </div>

        {/* Label and description */}
        {(label || description || error) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium leading-none cursor-pointer",
                  props.disabled && "cursor-not-allowed opacity-50",
                  error && "text-error"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground mt-1",
                  error && "text-error"
                )}
              >
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-error mt-1" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
