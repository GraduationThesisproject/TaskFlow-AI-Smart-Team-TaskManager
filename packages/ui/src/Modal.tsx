import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const modalOverlayVariants = cva(
  "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",
  {
    variants: {
      animation: {
        fade: "animate-in fade-in-0 duration-300",
        scale: "animate-in fade-in-0 zoom-in-95 duration-300",
        slide: "animate-in slide-in-from-bottom-4 duration-300",
      },
    },
    defaultVariants: {
      animation: "fade",
    },
  }
);

const modalContentVariants = cva(
  "relative z-50 w-full max-h-[90vh] overflow-auto bg-card border border-border rounded-lg shadow-xl",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md", 
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "6xl": "max-w-6xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      size: "md",
      padding: "default",
    },
  }
);

interface ModalProps extends VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  title?: string;
  description?: string;
  className?: string;
  overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size,
  padding,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  title,
  description,
  className,
  overlayClassName,
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render in a portal to avoid stacking/overflow issues from ancestors
  const content = (
    <div
      className={cn(modalOverlayVariants({ animation: "fade" }), overlayClassName)}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        className={cn(modalContentVariants({ size, padding }), className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
          aria-label="Close modal"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className={title || description ? "mt-4" : ""}>
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};

// Modal sub-components for better composition
export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("pb-4 border-b border-border", className)}>
    {children}
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("py-4", className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("pt-4 border-t border-border flex justify-end gap-2", className)}>
    {children}
  </div>
);

export { modalOverlayVariants, modalContentVariants };
