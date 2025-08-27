import React from 'react';
import { cn } from './utils';

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <option
      ref={ref}
      className={cn("bg-background text-foreground", className)}
      {...props}
    >
      {children}
    </option>
  )
);

SelectItem.displayName = "SelectItem";

export { SelectItem };
