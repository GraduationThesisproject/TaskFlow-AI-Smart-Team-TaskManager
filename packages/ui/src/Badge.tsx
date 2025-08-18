import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success text-white",
        warning: "border-transparent bg-warning text-white",
        error: "border-transparent bg-error text-white",
        info: "border-transparent bg-info text-white",
        accent: "border-transparent bg-accent text-accent-foreground",
        // Task status specific variants
        "to-do": "border-transparent bg-neutral-200 text-neutral-1000 dark:bg-neutral-200 dark:text-neutral-0",
        "in-progress": "border-transparent bg-primary text-primary-foreground",
        "in-review": "border-transparent bg-info text-white",
        "completed": "border-transparent bg-success text-white",
        // Priority variants
        "very-high": "border-transparent bg-error text-white",
        "high": "border-transparent bg-warning text-white",
        "medium": "border-transparent bg-primary text-primary-foreground",
        "low": "border-transparent bg-success text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
