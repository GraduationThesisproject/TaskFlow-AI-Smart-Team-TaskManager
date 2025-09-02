import React, { useState } from 'react';
import { Input } from '@taskflow/ui';
import { Search } from 'lucide-react';
import type { SearchBarProps } from '../../../types/interfaces/ui';

export const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '', 
  placeholder = "Search..." 
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className={`relative max-w-md ${className}`}>
      <Input
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        type="text"
        placeholder={placeholder}
        className={`h-10 bg-secondary border rounded-lg pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none transition-colors ${
          searchFocused ? 'border-primary' : 'border-input'
        }`}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  );
};
