import { Button } from "@taskflow/ui";

interface DashboardActionsProps {
  className?: string;
}

export function DashboardActions({ className = "" }: DashboardActionsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_upgrade)">
            <path 
              d="M8.66667 1.33301L2 9.33301H8L7.33333 14.6663L14 6.66634H8L8.66667 1.33301Z" 
              stroke="url(#paint0_linear_upgrade)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <linearGradient id="paint0_linear_upgrade" x1="2" y1="1.33301" x2="14" y2="14.6663" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
            <clipPath id="clip0_upgrade">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="text-foreground text-sm">Upgrade</span>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10.6673 14V12.6667C10.6673 11.9594 10.3864 11.2811 9.88627 10.781C9.38617 10.281 8.70789 10 8.00065 10H4.00065C3.29341 10 2.61513 10.281 2.11503 10.781C1.61494 11.2811 1.33398 11.9594 1.33398 12.6667V14" 
            stroke="url(#paint0_linear_invite)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M6.00065 7.33333C7.47341 7.33333 8.66732 6.13943 8.66732 4.66667C8.66732 3.19391 7.47341 2 6.00065 2C4.52789 2 3.33398 3.19391 3.33398 4.66667C3.33398 6.13943 4.52789 7.33333 6.00065 7.33333Z" 
            stroke="url(#paint1_linear_invite)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M14.666 14.0002V12.6669C14.6656 12.0761 14.4689 11.5021 14.1069 11.0351C13.7449 10.5682 13.2381 10.2346 12.666 10.0869M10.666 2.08691C11.2396 2.23378 11.748 2.56738 12.1111 3.03512C12.4742 3.50286 12.6712 4.07813 12.6712 4.67025C12.6712 5.26236 12.4742 5.83763 12.1111 6.30537C11.748 6.77311 11.2396 7.10671 10.666 7.25358" 
            stroke="url(#paint2_linear_invite)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="paint0_linear_invite" x1="1.33398" y1="10" x2="10.6673" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
            <linearGradient id="paint1_linear_invite" x1="3.33398" y1="2" x2="8.66732" y2="7.33333" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
            <linearGradient id="paint2_linear_invite" x1="10.666" y1="2.08691" x2="14.666" y2="14.0002" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-foreground text-sm">Invite</span>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M6.00065 11.3337H4.66732C3.78326 11.3337 2.93542 10.9825 2.3103 10.3573C1.68517 9.73223 1.33398 8.88438 1.33398 8.00033C1.33398 7.11627 1.68517 6.26842 2.3103 5.6433C2.93542 5.01818 3.78326 4.66699 4.66732 4.66699H6.00065M6.00065 11.3337V8.00033C6.00065 7.11627 6.35184 6.26842 6.97696 5.6433C7.60208 5.01818 8.44993 4.66699 9.33398 4.66699H10.6673C11.5514 4.66699 12.3992 5.01818 13.0243 5.6433C13.6495 6.26842 14.0007 7.11627 14.0007 8.00033V11.3337C14.0007 12.2177 13.6495 13.0656 13.0243 13.6907C12.3992 14.3158 11.5514 14.667 10.6673 14.667H9.33398C8.44993 14.667 7.60208 14.3158 6.97696 13.6907C6.35184 13.0656 6.00065 12.2177 6.00065 11.3337Z" 
            stroke="url(#paint0_linear_reports)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M6 8H10" 
            stroke="url(#paint1_linear_reports)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="paint0_linear_reports" x1="1.33398" y1="4.66699" x2="14.0007" y2="14.667" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
            <linearGradient id="paint1_linear_reports" x1="6" y1="8" x2="10" y2="8" gradientUnits="userSpaceOnUse">
              <stop stopColor="#007ADF" />
              <stop offset="1" stopColor="#00EBCB" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-foreground text-sm">Reports</span>
      </Button>
    </div>
  );
}
