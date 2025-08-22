import { Button } from "@taskflow/ui";
import { ChevronDown } from "lucide-react";
import { AuthButtons } from "./AuthButtons";

interface NavigationItem {
  name: string;
  hasDropdown: boolean;
  href?: string;
  dropdownItems?: Array<{
    name: string;
    href: string;
    description?: string;
  }>;
}

interface MobileMenuProps {
  items: NavigationItem[];
  isOpen: boolean;
  className?: string;
}

export function MobileMenu({ items, isOpen, className = "" }: MobileMenuProps) {
  if (!isOpen) return null;

  const handleItemClick = (item: NavigationItem) => {
    if (!item.hasDropdown && item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <div className={`md:hidden ${className}`}>
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
        {items.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-200"
            onClick={() => handleItemClick(item)}
          >
            <span>{item.name}</span>
            {item.hasDropdown && (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        ))}
        
        <div className="pt-4">
          <AuthButtons variant="mobile" />
        </div>
      </div>
    </div>
  );
}
