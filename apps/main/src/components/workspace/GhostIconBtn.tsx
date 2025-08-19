import React from 'react';
import { Button } from '@taskflow/ui';

export default function GhostIconBtn({ ariaLabel = 'Search', ...props }: { ariaLabel?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={ariaLabel}
      type="button"
      {...props}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 10.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </Button>
  );
}
