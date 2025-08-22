import React from 'react';
import { Button } from './Button';
import { cn } from './utils';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'github';
  children: React.ReactNode;
}

const SocialButton = React.forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ provider, children, className, ...props }, ref) => {
    const getIcon = () => {
      switch (provider) {
        case 'google':
          return (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8 10.2084C18.8 9.55837 18.7417 8.93337 18.6333 8.33337H10V11.8834H14.9333C14.7167 13.025 14.0667 13.9917 13.0917 14.6417V16.95H16.0667C17.8 15.35 18.8 13 18.8 10.2084Z" fill="currentColor"/>
              <path d="M9.99974 19.1667C12.4747 19.1667 14.5497 18.35 16.0664 16.95L13.0914 14.6417C12.2747 15.1917 11.2331 15.525 9.99974 15.525C7.61641 15.525 5.59141 13.9167 4.86641 11.75H1.81641V14.1167C3.32474 17.1083 6.41641 19.1667 9.99974 19.1667Z" fill="currentColor"/>
              <path d="M4.86732 11.7417C4.68398 11.1917 4.57565 10.6084 4.57565 10.0001C4.57565 9.39172 4.68398 8.80839 4.86732 8.25839V5.89172H1.81732C1.19232 7.12506 0.833984 8.51672 0.833984 10.0001C0.833984 11.4834 1.19232 12.8751 1.81732 14.1084L4.19232 12.2584L4.86732 11.7417Z" fill="currentColor"/>
              <path d="M9.99974 4.48337C11.3497 4.48337 12.5497 4.95004 13.5081 5.85004L16.1331 3.22504C14.5414 1.74171 12.4747 0.833374 9.99974 0.833374C6.41641 0.833374 3.32474 2.89171 1.81641 5.89171L4.86641 8.25837C5.59141 6.09171 7.61641 4.48337 9.99974 4.48337Z" fill="currentColor"/>
            </svg>
          );
        case 'github':
          return (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" fill="currentColor"/>
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "h-[50px] bg-input border border-border rounded-xl flex items-center justify-center gap-3 text-muted-foreground text-base font-normal leading-6 transition-all duration-150 ease-out hover:bg-secondary hover:text-foreground",
          className
        )}
        {...props}
      >
        {getIcon()}
        <span>{children}</span>
      </Button>
    );
  }
);

SocialButton.displayName = "SocialButton";

export { SocialButton };
