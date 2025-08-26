import React from 'react';

interface InfoBannerProps {
  workspaceId: string | null;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ workspaceId }) => {
  return (
    <div
      className="mb-4 p-3 ring-1 flex flex-row items-center gap-2 rounded-md shadow-[0_0_10px_hsl(var(--accent))] 
         ring-1 ring-primary/20 
         backdrop-blur bg-background"
      style={{
        background: 'linear-gradient(90deg, hsl(var(--info)) 0%, hsl(var(--accent)) 100%)',
        color: 'hsl(var(--primary-foreground))',
        ringColor: 'hsl(var(--ring))',
      } as React.CSSProperties}
    >
      <svg className="outline-none [&>path:first-of-type]:hidden" width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 24H0V0H16V24Z" stroke="#E5E7EB"/>
        <g clipPath="url(#clip0_213_92)">
          <path d="M8.0008 5C8.44455 5 8.85392 5.23437 9.07893 5.61875L15.8289 17.1187C16.0571 17.5062 16.0571 17.9844 15.8352 18.3719C15.6133 18.7594 15.1977 19 14.7508 19H1.2508C0.803925 19 0.3883 18.7594 0.166425 18.3719C-0.0554503 17.9844 -0.0523253 17.5031 0.172675 17.1187L6.92267 5.61875C7.14767 5.23437 7.55705 5 8.0008 5ZM8.0008 9C7.58517 9 7.2508 9.33437 7.2508 9.75V13.25C7.2508 13.6656 7.58517 14 8.0008 14C8.41642 14 8.7508 13.6656 8.7508 13.25V9.75C8.7508 9.33437 8.41642 9 8.0008 9ZM9.0008 16C9.0008 15.7348 8.89544 15.4804 8.70791 15.2929C8.52037 15.1054 8.26602 15 8.0008 15C7.73558 15 7.48123 15.1054 7.29369 15.2929C7.10616 15.4804 7.0008 15.7348 7.0008 16C7.0008 16.2652 7.10616 16.5196 7.29369 16.7071C7.48123 16.8946 7.73558 17 8.0008 17C8.26602 17 8.52037 16.8946 8.70791 16.7071C8.89544 16.5196 9.0008 16.2652 9.0008 16Z" fill="#00EBCB"/>
        </g>
        <defs>
          <clipPath id="clip0_213_92">
            <path d="M0 4H16V20H0V4Z" fill="white"/>
          </clipPath>
        </defs>
      </svg>

      <p className="text-md">
        {workspaceId ? 'You are the only owner of this account. We suggest you add another admin…' : 'Invalid or missing workspace id. Append ?id=<MongoObjectId> to the URL to load workspace data.'}
      </p>
    </div>
  );
};

export default InfoBanner;
