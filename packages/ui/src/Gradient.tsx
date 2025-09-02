import React from 'react';
import { cn } from './utils';

interface GradientProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'custom';
  direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  fromColor?: string;
  viaColor?: string;
  toColor?: string;
  animated?: boolean;
  overlay?: boolean;
}

 const Gradient: React.FC<GradientProps> = ({
  children,
  className,
  variant = 'primary',
  direction = 'to-br',
  fromColor,
  viaColor,
  toColor,
  animated = false,
  overlay = false
}) => {
  const variantClasses = {
    primary: 'from-[hsl(var(--gradient-primary))] to-[hsl(var(--gradient-secondary))]',
    secondary: 'from-[hsl(var(--gradient-secondary))] to-[hsl(var(--gradient-primary))]',
    accent: 'from-[hsl(var(--gradient-accent))] to-[hsl(var(--gradient-muted))]',
    muted: 'from-[hsl(var(--gradient-muted))] to-[hsl(var(--gradient-accent))]',
    custom: ''
  };

  const directionClasses = {
    'to-r': 'bg-gradient-to-r',
    'to-l': 'bg-gradient-to-l',
    'to-t': 'bg-gradient-to-t',
    'to-b': 'bg-gradient-to-b',
    'to-tr': 'bg-gradient-to-tr',
    'to-tl': 'bg-gradient-to-tl',
    'to-br': 'bg-gradient-to-br',
    'to-bl': 'bg-gradient-to-bl'
  };

  const customGradient = fromColor && toColor 
    ? `from-[${fromColor}] ${viaColor ? `via-[${viaColor}]` : ''} to-[${toColor}]`
    : '';

  const animationClasses = animated ? 'animate-pulse' : '';

  return (
    <div
      className={cn(
        'bg-gradient-to-br',
        directionClasses[direction],
        variant === 'custom' ? customGradient : variantClasses[variant],
        animationClasses,
        overlay && 'absolute inset-0 -z-10',
        className
      )}
    >
      {children}
    </div>
  );
};

// Predefined gradient components
export const PrimaryGradient: React.FC<Omit<GradientProps, 'variant'>> = (props) => (
  <Gradient variant="primary" {...props} />
);

export const SecondaryGradient: React.FC<Omit<GradientProps, 'variant'>> = (props) => (
  <Gradient variant="secondary" {...props} />
);

export const AccentGradient: React.FC<Omit<GradientProps, 'variant'>> = (props) => (
  <Gradient variant="accent" {...props} />
);

export const MutedGradient: React.FC<Omit<GradientProps, 'variant'>> = (props) => (
  <Gradient variant="muted" {...props} />
);

// Radial gradient component
interface RadialGradientProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'custom';
  fromColor?: string;
  viaColor?: string;
  toColor?: string;
  shape?: 'circle' | 'ellipse';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const RadialGradient: React.FC<RadialGradientProps> = ({
  children,
  className,
  variant = 'primary',
  fromColor,
  viaColor,
  toColor,
  shape = 'circle',
  position = 'center'
}) => {
  const variantClasses = {
    primary: 'from-[hsl(var(--gradient-primary))] to-[hsl(var(--gradient-secondary))]',
    secondary: 'from-[hsl(var(--gradient-secondary))] to-[hsl(var(--gradient-primary))]',
    accent: 'from-[hsl(var(--gradient-accent))] to-[hsl(var(--gradient-muted))]',
    muted: 'from-[hsl(var(--gradient-muted))] to-[hsl(var(--gradient-accent))]',
    custom: ''
  };

  const customGradient = fromColor && toColor 
    ? `from-[${fromColor}] ${viaColor ? `via-[${viaColor}]` : ''} to-[${toColor}]`
    : '';

  const radialClass = `bg-[radial-gradient(${shape}_at_${position},${variant === 'custom' ? customGradient : variantClasses[variant].replace('bg-gradient-to-br ', '')})]`;

  return (
    <div className={cn(radialClass, className)}>
      {children}
    </div>
  );
};

// Conic gradient component
interface ConicGradientProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'custom';
  fromColor?: string;
  viaColor?: string;
  toColor?: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const ConicGradient: React.FC<ConicGradientProps> = ({
  children,
  className,
  variant = 'primary',
  fromColor,
  viaColor,
  toColor,
  position = 'center'
}) => {
  const variantClasses = {
    primary: 'from-[hsl(var(--gradient-primary))] via-[hsl(var(--gradient-secondary))] to-[hsl(var(--gradient-primary))]',
    secondary: 'from-[hsl(var(--gradient-secondary))] via-[hsl(var(--gradient-primary))] to-[hsl(var(--gradient-secondary))]',
    accent: 'from-[hsl(var(--gradient-accent))] via-[hsl(var(--gradient-muted))] to-[hsl(var(--gradient-accent))]',
    muted: 'from-[hsl(var(--gradient-muted))] via-[hsl(var(--gradient-accent))] to-[hsl(var(--gradient-muted))]',
    custom: ''
  };

  const customGradient = fromColor && toColor 
    ? `from-[${fromColor}] ${viaColor ? `via-[${viaColor}]` : ''} to-[${toColor}]`
    : '';

  const conicClass = `bg-[conic-gradient(from_0deg_at_${position},${variant === 'custom' ? customGradient : variantClasses[variant].replace('bg-gradient-to-br ', '')})]`;

  return (
    <div className={cn(conicClass, className)}>
      {children}
    </div>
  );
};
export default Gradient;