import { Dropdown, DropdownItem } from "@taskflow/ui";
import { ChevronDown } from "lucide-react";

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

interface NavigationLinksProps {
  items: NavigationItem[];
  className?: string;
}

export function NavigationLinks({ items, className = "" }: NavigationLinksProps) {
  const handleItemClick = (item: NavigationItem) => {
    if (!item.hasDropdown && item.href) {
      window.location.href = item.href;
    }
  };

  const handleDropdownItemClick = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className={`flex items-center gap-4 ml-8 ${className}`}>
      {items.map((item) => (
        <div key={item.name} className="relative">
          {item.hasDropdown ? (
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer">
                  <span className="text-gray-300 hover:text-white text-sm transition-colors">
                    {item.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </div>
              }
              contentClassName="bg-black border-gray-800"
            >
              {item.dropdownItems?.map((dropdownItem) => (
                <DropdownItem
                  key={dropdownItem.name}
                  onClick={() => handleDropdownItemClick(dropdownItem.href)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <div>
                    <div className="font-medium">{dropdownItem.name}</div>
                    {dropdownItem.description && (
                      <div className="text-xs text-gray-400">{dropdownItem.description}</div>
                    )}
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <span className="text-gray-300 hover:text-white text-sm transition-colors">
                {item.name}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
