import React, { JSX } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-text-36 font-bold leading-tight tracking-tight",
      "heading-xl": "text-text-36 font-bold leading-tight tracking-tight",
      "heading-large": "text-text-20 font-bold leading-tight",
      h2: "text-text-20 font-bold leading-tight",
      h3: "text-lg font-semibold leading-tight",
      h4: "text-base font-semibold leading-tight",
      "body-large": "text-text-18 font-normal leading-normal",
      interregular24: "text-2xl font-normal leading-normal",
      "body-medium": "text-text-16 font-normal leading-normal",
      "body-small": "text-text-14 font-normal leading-normal",
      p: "text-text-16 font-normal leading-normal",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      caption: "text-xs text-muted-foreground",
      label: "text-sm font-medium leading-none",
      body: "text-text-16 font-normal leading-normal",
    },
    textColor: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      accent: "text-accent",
      success: "text-success",
      warning: "text-warning",
      error: "text-error",
      white: "text-white",
    },
  },
  defaultVariants: {
    variant: "p",
    textColor: "default",
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const Typography = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, variant, textColor, as, ...props }, ref) => {
    const Component = as || getDefaultTag(variant) || "p";
    const classes = cn(typographyVariants({ variant, textColor, className }));
    
    return React.createElement(Component, {
      className: classes,
      ref,
      ...props
    });
  }
);

Typography.displayName = "Typography";

function getDefaultTag(variant: TypographyProps['variant']): keyof JSX.IntrinsicElements {
  switch (variant) {
    case 'h1':
    case 'heading-xl':
      return 'h1';
    case 'h2':
    case 'heading-large':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'lead':
    case 'large':
    case 'body-large':
    case 'body-medium':
    case 'body-small':
    case 'body':
    case 'p':
      return 'p';
    case 'small':
    case 'muted':
    case 'caption':
    case 'label':
      return 'span';
    case 'interregular24':
      return 'p';
    default:
      return 'p';
  }
}

export { Typography, typographyVariants };
