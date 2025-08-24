import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    variant: {
      default: 'bg-muted',
      card: 'bg-card',
      input: 'bg-background border border-input',
    },
    size: {
      default: 'h-4 w-full',
      sm: 'h-3 w-20',
      lg: 'h-6 w-full',
      xl: 'h-8 w-full',
      '2xl': 'h-12 w-full',
      '3xl': 'h-16 w-full',
    },
    rounded: {
      default: 'rounded-md',
      sm: 'rounded-sm',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
      none: 'rounded-none',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    rounded: 'default',
  },
});

export interface SkeletonProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = ({
  className,
  variant,
  size,
  rounded,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(skeletonVariants({ variant, size, rounded, className }))}
      {...props}
    />
  );
};

export { Skeleton, skeletonVariants };
