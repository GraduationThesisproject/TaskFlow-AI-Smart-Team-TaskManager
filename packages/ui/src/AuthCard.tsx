import React from 'react';
import { Card, CardContent } from './Card';
import { Typography } from './Typography';
import { cn } from './utils';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  className?: string;
}

const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ children, title, subtitle, description, className }, ref) => {
    return (
      <div className="h-screen w-full bg-background font-['Inter'] flex items-center justify-center p-6">
        <Card 
          ref={ref}
          variant="elevated"
          className={cn(
            "w-full max-w-md bg-card border border-accent rounded-3xl shadow-[0_20px_60px_0_rgba(0,0,0,0.40)]",
            className
          )}
        >
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              {/* Logo */}
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl shadow-[0_8px_32px_0_rgba(79,70,229,0.30)] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M10.5 14L12.8333 16.3333L17.5 11.6667M24.5 14C24.5 15.3789 24.2284 16.7443 23.7007 18.0182C23.1731 19.2921 22.3996 20.4496 21.4246 21.4246C20.4496 22.3996 19.2921 23.1731 18.0182 23.7007C16.7443 24.2284 15.3789 24.5 14 24.5C12.6211 24.5 11.2557 24.2284 9.98182 23.7007C8.70791 23.1731 7.55039 22.3996 6.57538 21.4246C5.60036 20.4496 4.82694 19.2921 4.29926 18.0182C3.77159 16.7443 3.5 15.3789 3.5 14C3.5 11.2152 4.60625 8.54451 6.57538 6.57538C8.54451 4.60625 11.2152 3.5 14 3.5C16.7848 3.5 19.4555 4.60625 21.4246 6.57538C23.3938 8.54451 24.5 11.2152 24.5 14Z" 
                    stroke="hsl(var(--foreground))" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none"
                  />
                </svg>
              </div>
              
              {/* Title */}
              <Typography variant="h2" className="text-foreground text-2xl font-normal leading-9 mb-2">
                {title}
              </Typography>
              
              {/* Subtitle */}
              <Typography variant="h3" className="text-accent text-[28px] font-normal leading-[42px] text-center mb-4">
                {subtitle}
              </Typography>
              
              {/* Description */}
              <Typography variant="body-medium" className="text-muted-foreground text-base font-normal leading-6 text-center max-w-[343px]">
                {description}
              </Typography>
            </div>

            {children}
          </CardContent>
        </Card>
      </div>
    );
  }
);

AuthCard.displayName = "AuthCard";

export { AuthCard };
