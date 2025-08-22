import { useState } from "react";
import { Input } from "@taskflow/ui";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className = "", placeholder = "Search..." }: SearchBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className={`flex-1 max-w-[275px] ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full h-[42px] bg-input border border-border rounded-lg pl-10 pr-4 text-foreground text-base placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            searchFocused ? 'ring-2 ring-primary' : ''
          }`}
        />
        <svg 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" 
            stroke="url(#paint0_linear_search)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M13.9996 13.9996L11.0996 11.0996" 
            stroke="url(#paint1_linear_search)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="paint0_linear_search" x1="2" y1="2" x2="12.6667" y2="12.6667" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
            <linearGradient id="paint1_linear_search" x1="11.0996" y1="11.0996" x2="13.9996" y2="13.9996" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
