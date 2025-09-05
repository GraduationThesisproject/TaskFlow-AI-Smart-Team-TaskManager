import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-background transition-all duration-200",
  {
    variants: {
      size: {
        xs: "h-6 w-6 ring-1",
        sm: "h-8 w-8 ring-1",
        default: "h-10 w-10 ring-2",
        lg: "h-12 w-12 ring-2",
        xl: "h-16 w-16 ring-2",
        "2xl": "h-20 w-20 ring-2",
        "3xl": "h-24 w-24 ring-2",
      },
      variant: {
        default: "",
        square: "rounded-lg",
        rounded: "rounded-xl",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

const avatarImageVariants = cva(
  "aspect-square h-full w-full object-cover transition-all duration-200",
  {
    variants: {
      loading: {
        true: "animate-pulse bg-muted",
        false: "",
      },
    },
    defaultVariants: {
      loading: false,
    },
  }
);

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center font-semibold shadow-inner",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground",
        primary: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
        accent: "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground",
        success: "bg-gradient-to-br from-success to-success/80 text-white",
        warning: "bg-gradient-to-br from-warning to-warning/80 text-white",
        error: "bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground",
        purple: "bg-gradient-to-br from-purple to-purple/80 text-purple-foreground",
        blue: "bg-gradient-to-br from-info to-info/80 text-info-foreground",
        pink: "bg-gradient-to-br from-pink to-pink/80 text-pink-foreground",
        indigo: "bg-gradient-to-br from-indigo to-indigo/80 text-indigo-foreground",
        teal: "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground",
      },
      size: {
        xs: "text-xs",
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
        "3xl": "text-2xl",
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
    VariantProps<typeof avatarVariants> {
  status?: 'online' | 'offline' | 'away' | 'busy';
  statusColor?: string;
}

interface AvatarImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  loading?: boolean;
}

interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarFallbackVariants> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, variant, status, statusColor, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(avatarVariants({ size, variant }), className)}
      {...props}
    >
      {children}
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            status === 'online' && "bg-success",
            status === 'offline' && "bg-muted-foreground/50",
            status === 'away' && "bg-warning",
            status === 'busy' && "bg-destructive",
            size === 'xs' && "h-2 w-2",
            size === 'sm' && "h-2.5 w-2.5",
            size === 'lg' && "h-3.5 w-3.5",
            size === 'xl' && "h-4 w-4",
            size === '2xl' && "h-5 w-5",
            size === '3xl' && "h-6 w-6"
          )}
          style={statusColor ? { backgroundColor: statusColor } : undefined}
        />
      )}
    </div>
  )
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onError, loading = false, ...props }, ref) => (
    <img
      ref={ref}
      className={cn(avatarImageVariants({ loading }), className)}
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
  if (!name) return '?';
  
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Utility function to generate a consistent color based on a string
export const getAvatarColor = (str: string): AvatarFallbackProps['variant'] => {
  if (!str) return 'primary';
  
  const colors: AvatarFallbackProps['variant'][] = [
    'primary', 'accent', 'success', 'warning', 'error', 
    'purple', 'blue', 'pink', 'indigo', 'teal'
  ];
  
  const hash = str.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length] || 'primary';
};

// Enhanced component that automatically handles image fallbacks
interface AvatarWithFallbackProps extends AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  loading?: boolean;
  showStatus?: boolean;
}

const AvatarWithFallback = React.forwardRef<HTMLDivElement, AvatarWithFallbackProps>(
  ({ 
    className, 
    size, 
    variant, 
    src, 
    alt, 
    fallback, 
    loading = false,
    showStatus = false,
    status,
    children, 
    ...props 
  }, ref) => {
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

    // Generate color variant from alt text or fallback
    const getColorVariant = () => {
      if (variant && variant !== 'square' && variant !== 'rounded') return variant;
      const text = alt || fallback || '';
      return getAvatarColor(text);
    };

    // Auto-generate status if showStatus is true
    const getStatus = () => {
      if (status) return status;
      if (showStatus) {
        const statuses: Array<'online' | 'offline' | 'away' | 'busy'> = ['online', 'offline', 'away', 'busy'];
        const text = alt || fallback || '';
        const hash = text.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return statuses[Math.abs(hash) % statuses.length];
      }
      return undefined;
    };

    return (
      <Avatar
        ref={ref}
        className={cn(avatarVariants({ size, variant }), className)}
        status={getStatus()}
        {...props}
      >
        {src && !imageError ? (
          <AvatarImage
            src={src}
            alt={alt}
            loading={loading}
            className={avatarImageVariants({ loading })}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : null}
        
        {(!src || imageError || !imageLoaded) && (
          <AvatarFallback 
            variant={getColorVariant()}
            size={size}
          >
            {getFallbackText()}
          </AvatarFallback>
        )}
      </Avatar>
    );
  }
);
AvatarWithFallback.displayName = "AvatarWithFallback";

// Avatar Group component for displaying multiple avatars
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  spacing?: 'tight' | 'normal' | 'loose';
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max, size = 'default', spacing = 'normal', ...props }, ref) => {
    const avatars = React.Children.toArray(children);
    const displayAvatars = max ? avatars.slice(0, max) : avatars;
    const remainingCount = max ? avatars.length - max : 0;

    const spacingClasses = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: '-space-x-3',
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", spacingClasses[spacing], className)}
        {...props}
      >
        {displayAvatars.map((avatar, index) => (
          <div key={index} className="relative">
            {React.cloneElement(avatar as React.ReactElement, { size })}
          </div>
        ))}
        {remainingCount > 0 && (
          <Avatar size={size} className="bg-muted/50 text-muted-foreground">
            <AvatarFallback size={size} variant="default">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { 
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  AvatarWithFallback, 
  AvatarGroup,
  avatarVariants,
  avatarImageVariants,
  avatarFallbackVariants
};
