import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@taskflow/ui';

export default function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Card variant="elevated" className="rounded-xl shadow-[0_0_10px_hsl(var(--accent))] 
             backdrop-blur bg-neutral-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}
