import React from 'react';

const PageHeader: React.FC = () => {
  return (
    <header className="p-4 mb-4 border-b-2 border-neutral-100">
      <h1 className="text-3xl font-bold tracking-tight " style={{ color: 'hsl(var(--primary-foreground))' }}>
        workspace member management
      </h1>
    </header>
  );
};

export default PageHeader;
