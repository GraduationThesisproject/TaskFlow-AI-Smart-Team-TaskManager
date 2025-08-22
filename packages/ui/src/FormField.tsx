import React, { useState } from 'react';
import { Input } from './Input';
import { Typography } from './Typography';
import { Button } from './Button';
import { cn } from './utils';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: 'email' | 'password' | 'user';
  showPasswordToggle?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, showPasswordToggle = false, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    const getIcon = () => {
      switch (icon) {
        case 'email':
          return <Mail className="w-5 h-5 text-muted-foreground" />;
        case 'password':
          return <Lock className="w-5 h-5 text-muted-foreground" />;
        case 'user':
          return <User className="w-5 h-5 text-muted-foreground" />;
        default:
          return null;
      }
    };

    return (
      <div className="space-y-2">
        <Typography 
          variant="body-small" 
          className="text-muted-foreground text-sm font-normal leading-[21px]"
        >
          {label}
        </Typography>
        
        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "h-[50px] bg-input border border-border rounded-xl pl-4 text-foreground text-base transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent placeholder-muted-foreground",
              icon && "pl-12",
              (showPasswordToggle || icon) && "pr-12",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              isFocused && "ring-2 ring-accent border-accent",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {/* Left Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {getIcon()}
            </div>
          )}
          
          {/* Password Toggle */}
          {showPasswordToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-auto w-auto p-0 hover:bg-transparent"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </Button>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <Typography variant="body-small" className="text-destructive text-xs">
            {error}
          </Typography>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
