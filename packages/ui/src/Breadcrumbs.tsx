import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from './utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  separator = <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
}) => {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="flex items-center" aria-hidden="true">
              {separator}
            </span>
          )}
          <BreadcrumbItem item={item} isLast={index === items.length - 1} />
        </React.Fragment>
      ))}
    </nav>
  );
};

interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  isLast: boolean;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ item, isLast }) => {
  const Component = item.href ? 'a' : item.onClick ? 'button' : 'span';
  
  return (
    <Component
      href={item.href}
      onClick={item.onClick}
      className={cn(
        'transition-colors hover:text-foreground',
        isLast && 'text-foreground font-medium',
        !isLast && 'hover:underline',
        item.onClick && 'cursor-pointer'
      )}
      aria-current={isLast ? 'page' : undefined}
    >
      {item.label}
    </Component>
  );
};
