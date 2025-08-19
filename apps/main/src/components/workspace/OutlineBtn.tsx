import React from 'react';

export default function OutlineBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="rounded-md border px-3 py-1.5 text-sm"
      style={{
        borderColor: 'hsl(var(--border))',
        color: 'hsl(var(--primary-foreground))',
        backgroundColor: 'hsl(var(--neutral-100))',
      }}
    >
      {children}
    </button>
  );
}
