import React from 'react';
import { Badge } from '@taskflow/ui';

// Narrow set of variants we use across the workspace
export type PillVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'accent';

export default function Pill({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: PillVariant;
}) {
  return (
    <Badge variant={variant} size="sm">
      {children}
    </Badge>
  );
}
