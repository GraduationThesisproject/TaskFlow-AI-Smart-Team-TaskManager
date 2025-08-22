import { Button } from "@taskflow/ui";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function MenuButton({ isOpen, onClick, className = "" }: MenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`w-10 h-10 rounded-full border-2 border-transparent hover:bg-muted transition-colors ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M2.5 10H17.5M2.5 5H17.5M2.5 15H17.5" 
          stroke="url(#paint0_linear_menu)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="paint0_linear_menu" x1="2.5" y1="5" x2="17.5" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#007ADF" />
            <stop offset="1" stopColor="#00EBCB" />
          </linearGradient>
        </defs>
      </svg>
    </Button>
  );
}
