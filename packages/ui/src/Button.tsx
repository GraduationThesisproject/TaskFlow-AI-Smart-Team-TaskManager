import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_2px_rgba(0,122,223,0.35)] hover:shadow-[0_0_16px_4px_rgba(0,122,223,0.55)]",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_2px_rgba(0,122,223,0.35)] hover:shadow-[0_0_16px_4px_rgba(0,122,223,0.55)]",
        gradient: "bg-gradient-to-r from-[hsl(var(--gradient-primary))] to-[hsl(var(--gradient-secondary))] text-white shadow-[0_0_12px_2px_rgba(0,122,223,0.35)] hover:shadow-[0_0_18px_5px_rgba(0,122,223,0.55)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_12px_2px_rgba(0,232,198,0.35)] hover:shadow-[0_0_16px_4px_rgba(0,232,198,0.55)]",
        neon: "relative text-white bg-gradient-to-r from-[hsl(var(--gradient-primary))] to-[hsl(var(--gradient-secondary))] shadow-[0_0_16px_3px_rgba(0,186,255,0.35)] hover:shadow-[0_0_22px_5px_rgba(0,186,255,0.6)]",
        // New: use for add/create actions to get a circular moving glow on hover
        add: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full orbit-glow shadow-[0_0_12px_2px_rgba(0,122,223,0.35)] hover:shadow-[0_0_16px_4px_rgba(0,122,223,0.55)]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
