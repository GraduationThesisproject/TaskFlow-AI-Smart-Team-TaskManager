import React, { useState } from 'react';
import { Button } from '@taskflow/ui';
import { ChevronDown } from 'lucide-react';
import type { NavigationItem } from '../../../types/navbar';
import type { NavigationLinksProps } from '../../../types/interfaces/ui';

export const NavigationLinks: React.FC<NavigationLinksProps> = ({ items, className = '' }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {items.map((item) => (
        <div key={item.name} className="relative">
          {item.hasDropdown ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDropdown(item.name)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                {item.name}
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {openDropdown === item.name && item.dropdownItems && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
                  {item.dropdownItems.map((dropdownItem) => (
                    <a
                      key={dropdownItem.name}
                      href={dropdownItem.href}
                      className="block px-4 py-3 hover:bg-secondary/60 transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-foreground">{dropdownItem.name}</div>
                      {dropdownItem.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {dropdownItem.description}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <a
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
