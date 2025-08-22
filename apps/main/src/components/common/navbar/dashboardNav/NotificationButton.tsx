import { Button } from "@taskflow/ui";

interface NotificationButtonProps {
  count?: number;
  className?: string;
}

export function NotificationButton({ count = 0, className = "" }: NotificationButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative w-10 h-10 rounded-full border-2 border-transparent hover:bg-muted transition-colors ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_notification)">
          <path 
            d="M15 6.66699C15 5.34091 14.4732 4.06914 13.5355 3.13146C12.5979 2.19378 11.3261 1.66699 10 1.66699C8.67392 1.66699 7.40215 2.19378 6.46447 3.13146C5.52678 4.06914 5 5.34091 5 6.66699C5 12.5003 2.5 14.167 2.5 14.167H17.5C17.5 14.167 15 12.5003 15 6.66699Z" 
            stroke="url(#paint0_linear_notification)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M11.4419 17.5C11.2954 17.7526 11.0851 17.9622 10.8321 18.1079C10.5791 18.2537 10.2922 18.3304 10.0003 18.3304C9.70828 18.3304 9.42142 18.2537 9.1684 18.1079C8.91539 17.9622 8.7051 17.7526 8.55859 17.5" 
            stroke="url(#paint1_linear_notification)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <linearGradient id="paint0_linear_notification" x1="2.5" y1="1.66699" x2="17.5" y2="17.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#007ADF" />
            <stop offset="1" stopColor="#00EBCB" />
          </linearGradient>
          <linearGradient id="paint1_linear_notification" x1="8.55859" y1="17.5" x2="11.4419" y2="17.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#007ADF" />
            <stop offset="1" stopColor="#00EBCB" />
          </linearGradient>
          <clipPath id="clip0_notification">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
      {count > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
      )}
    </Button>
  );
}
