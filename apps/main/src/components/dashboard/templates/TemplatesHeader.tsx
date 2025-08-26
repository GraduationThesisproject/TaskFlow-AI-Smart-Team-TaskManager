import React from 'react';
import { Typography } from '@taskflow/ui';

const TemplatesHeader: React.FC = () => {

  return (
    <div className="mb-6 rounded-lg p-4 backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)]">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Templates
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground">
            Browse and use professional templates for your projects
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default TemplatesHeader;
