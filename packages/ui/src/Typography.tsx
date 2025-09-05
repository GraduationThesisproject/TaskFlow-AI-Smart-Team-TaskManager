import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-2xl font-semibold leading-tight tracking-tight",
      "heading-xl": "text-2xl font-semibold leading-tight tracking-tight",
      "heading-large": "text-lg font-semibold leading-tight",
      h2: "text-lg font-semibold leading-tight",
      h3: "text-base font-semibold leading-tight",
      h4: "text-sm font-semibold leading-tight",
      "body-large": "text-base font-normal leading-normal",
      interregular24: "text-xl font-normal leading-normal",
      "body-medium": "text-sm font-normal leading-normal",
      "body-small": "text-xs font-normal leading-normal",
      p: "text-sm font-normal leading-normal",
      lead: "text-base text-muted-foreground",
      large: "text-base font-semibold",
      small: "text-xs font-medium leading-none",
      muted: "text-xs text-muted-foreground",
      caption: "text-xs text-muted-foreground",
      label: "text-xs font-medium leading-none",
      body: "text-sm font-normal leading-normal",
      // New professional variants
      "heading-compact": "text-xl font-semibold leading-tight tracking-tight",
      "subtitle": "text-sm font-medium text-muted-foreground leading-tight",
      "card-title": "text-sm font-semibold leading-tight",
      "card-subtitle": "text-xs font-medium text-muted-foreground leading-tight",
      "metric": "text-lg font-bold leading-tight",
      "metric-label": "text-xs font-medium text-muted-foreground leading-tight",
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
    case 'heading-compact':
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
    case 'subtitle':
      return 'p';
    case 'p':
      return 'p';
    case 'small':
    case 'muted':
    case 'caption':
    case 'label':
    case 'card-title':
    case 'card-subtitle':
    case 'metric':
    case 'metric-label':
      return 'span';
    case 'interregular24':
      return 'p';
    default:
      return 'p';
  }
}

export { Typography, typographyVariants };
