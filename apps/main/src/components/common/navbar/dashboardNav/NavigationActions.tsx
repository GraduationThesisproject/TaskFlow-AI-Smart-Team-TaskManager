import { Button } from "@taskflow/ui";

interface NavigationActionsProps {
  className?: string;
}

export function NavigationActions({ className = "" }: NavigationActionsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M2.5 7.50033L10 1.66699L17.5 7.50033V16.667C17.5 17.109 17.3244 17.5329 17.0118 17.8455C16.6993 18.1581 16.2754 18.3337 15.8333 18.3337H4.16667C3.72464 18.3337 3.30072 18.1581 2.98816 17.8455C2.67559 17.5329 2.5 17.109 2.5 16.667V7.50033Z" 
            stroke="url(#paint0_linear_home)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M7.5 18.3333V10H12.5V18.3333" 
            stroke="url(#paint1_linear_home)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="paint0_linear_home" x1="2.5" y1="1.66699" x2="17.5" y2="18.3337" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
            <linearGradient id="paint1_linear_home" x1="7.5" y1="10" x2="12.5" y2="18.3333" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-foreground text-sm">Home</span>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M8.00065 3.33301V12.6663M3.33398 7.99967H12.6673" 
            stroke="url(#paint0_linear_create)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="paint0_linear_create" x1="3.33398" y1="3.33301" x2="12.6673" y2="12.6663" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-foreground text-sm">Create</span>
      </Button>
    </div>
  );
}
