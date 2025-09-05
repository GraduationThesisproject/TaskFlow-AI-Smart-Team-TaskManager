import React from 'react';
import type { InfoBannerProps } from './types';

const InfoBanner: React.FC<InfoBannerProps> = ({ workspaceId }) => {
  return (
    <div className="mb-4 p-3 border border-destructive/20 rounded-md bg-destructive/5">
      <div className="flex items-center gap-2">
        <svg 
          className="w-4 h-4 text-destructive flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <p className="text-sm text-destructive">
          {workspaceId 
            ? 'You are the only owner of this account. We suggest you add another admin for better security.' 
            : 'Invalid or missing workspace id. Append ?id=<MongoObjectId> to the URL to load workspace data.'
          }
        </p>
      </div>
    </div>
  );
};

export default InfoBanner;
