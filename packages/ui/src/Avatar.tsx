import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarImageVariants = cva("aspect-square h-full w-full object-cover");

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full font-medium text-white",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary text-primary-foreground",
        accent: "bg-accent text-accent-foreground",
        success: "bg-success text-white",
        warning: "bg-warning text-white",
        error: "bg-error text-white",
      },
      size: {
        xs: "text-xs",
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarFallbackVariants> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onError, ...props }, ref) => (
    <img
      ref={ref}
      className={cn(avatarImageVariants(), className)}
      onError={(e) => {
        // Hide the image on error
        e.currentTarget.style.display = 'none';
        // Call the original onError if provided
        onError?.(e);
      }}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(avatarFallbackVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
AvatarFallback.displayName = "AvatarFallback";

// Utility function to generate initials from a name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Utility function to generate a consistent color based on a string
export const getAvatarColor = (str: string): AvatarFallbackProps['variant'] => {
  const colors: AvatarFallbackProps['variant'][] = ['primary', 'accent', 'success', 'warning', 'error'];
  const hash = str.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

// New component that automatically handles image fallbacks
interface AvatarWithFallbackProps extends AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
}

const AvatarWithFallback = React.forwardRef<HTMLDivElement, AvatarWithFallbackProps>(
  ({ className, size, src, alt, fallback, children, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    // Generate fallback initials from alt text or fallback prop
    const getFallbackText = () => {
      if (fallback) return fallback;
      if (alt) return getInitials(alt);
      return children || '?';
    };

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src && !imageError && (
          <img
            src={src}
            alt={alt}
            className={cn(avatarImageVariants())}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
        {(!src || imageError || !imageLoaded) && (
          <div className={cn(avatarFallbackVariants({ size }))}>
            {getFallbackText()}
          </div>
        )}
      </div>
    );
  }
);
AvatarWithFallback.displayName = "AvatarWithFallback";

export { Avatar, AvatarImage, AvatarFallback, AvatarWithFallback, avatarVariants };
