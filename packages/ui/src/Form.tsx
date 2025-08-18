import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const formVariants = cva("space-y-6", {
  variants: {
    size: {
      sm: "space-y-4",
      default: "space-y-6",
      lg: "space-y-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const fieldGroupVariants = cva("space-y-2", {
  variants: {
    spacing: {
      tight: "space-y-1",
      default: "space-y-2",
      loose: "space-y-3",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement>, VariantProps<typeof formVariants> {
  children: React.ReactNode;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, size, children, ...props }, ref) => (
    <form
      ref={ref}
      className={cn(formVariants({ size }), className)}
      {...props}
    >
      {children}
    </form>
  )
);
Form.displayName = "Form";

interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof fieldGroupVariants> {
  children: React.ReactNode;
}

export const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, spacing, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(fieldGroupVariants({ spacing }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
FieldGroup.displayName = "FieldGroup";

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, required, error, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium leading-6",
        error ? "text-error" : "text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-error">*</span>}
    </label>
  )
);
FieldLabel.displayName = "FieldLabel";

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-error", className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  )
);
FieldError.displayName = "FieldError";

interface FieldHintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const FieldHint = React.forwardRef<HTMLParagraphElement, FieldHintProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
);
FieldHint.displayName = "FieldHint";

// Complete Field component that combines all field parts
interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  spacing?: VariantProps<typeof fieldGroupVariants>['spacing'];
}

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  required,
  children,
  className,
  spacing,
}) => (
  <FieldGroup spacing={spacing} className={className}>
    {label && (
      <FieldLabel required={required} error={!!error}>
        {label}
      </FieldLabel>
    )}
    {hint && !error && <FieldHint>{hint}</FieldHint>}
    {children}
    {error && <FieldError>{error}</FieldError>}
  </FieldGroup>
);

// Form section for grouping related fields
interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
  ...props
}) => (
  <div className={cn("space-y-4", className)} {...props}>
    {(title || description) && (
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-medium leading-6 text-foreground">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    )}
    <div className="space-y-6">{children}</div>
  </div>
);

// Form actions (buttons) wrapper
interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  sticky = false,
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex gap-3 pt-6 border-t border-border",
      {
        'justify-start': align === 'left',
        'justify-center': align === 'center',
        'justify-end': align === 'right',
        'sticky bottom-0 bg-background p-4 -mx-4 -mb-4': sticky,
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Two column form layout
interface FormColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: 'sm' | 'default' | 'lg';
}

export const FormColumns: React.FC<FormColumnsProps> = ({
  children,
  gap = 'default',
  className,
  ...props
}) => (
  <div
    className={cn(
      "grid grid-cols-1 md:grid-cols-2",
      {
        'gap-4': gap === 'sm',
        'gap-6': gap === 'default',
        'gap-8': gap === 'lg',
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export {
  formVariants,
  fieldGroupVariants,
};
