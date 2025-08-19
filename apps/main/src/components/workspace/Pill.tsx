import React from 'react';

export default function Pill({ children, colorVar }: { children: React.ReactNode; colorVar: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `hsl(${colorVar})`,
        color: 'hsl(var(--primary-foreground))',
      }}
    >
      {children}
    </span>
  );
}
