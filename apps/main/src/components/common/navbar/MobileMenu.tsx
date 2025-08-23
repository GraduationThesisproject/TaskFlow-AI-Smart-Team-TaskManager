import React from 'react';
import { Button } from '@taskflow/ui';
import type { NavigationItem } from '../../../types/navbar';

interface MobileMenuProps {
  items: NavigationItem[];
  isOpen: boolean;
  className?: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ items, isOpen, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className={`absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg md:hidden ${className}`}>
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div key={item.name} className="space-y-2">
            {item.hasDropdown && item.dropdownItems ? (
              <>
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="pl-4 space-y-2">
                  {item.dropdownItems.map((dropdownItem) => (
                    <a
                      key={dropdownItem.name}
                      href={dropdownItem.href}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {dropdownItem.name}
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <a
                href={item.href}
                className="block text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            )}
          </div>
        ))}
        
        {/* Mobile Auth Buttons */}
        <div className="pt-4 border-t border-border space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Sign In
          </Button>
          <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};
