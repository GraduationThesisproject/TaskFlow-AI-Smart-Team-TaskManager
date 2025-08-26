import React from 'react';
import { Button } from '@taskflow/ui';

export default function OutlineBtn({ children, ...props }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button className="bg-background " variant="outline" size="sm" {...props}>
      {children}
    </Button>
  );
}
