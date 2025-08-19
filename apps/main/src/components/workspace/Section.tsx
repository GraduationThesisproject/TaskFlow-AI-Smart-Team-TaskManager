import React from 'react';

export default function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_0_18px_1px_rgba(0,0,0,0.35)]"
      style={{
        backgroundColor: 'hsl(var(--neutral-200))',
        boxShadow: '0 0 0 1px hsl(var(--neutral-100)), 0 0 22px 1px hsl(var(--accent))',
      }}
    >
      <h2 className="text-base font-semibold" style={{ color: 'hsl(var(--primary-foreground))' }}>
        {title}
      </h2>
      <div className="mt-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {children}
      </div>
    </section>
  );
}
