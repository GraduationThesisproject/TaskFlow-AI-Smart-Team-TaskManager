import React from 'react';
import { Typography } from '@taskflow/ui';

interface SettingsHeaderProps {
  title: string;
  status: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, status }) => {
  return (
    <header className="mb-6 flex flex-row items-center border-b border-[hsl(var(--neutral-200))]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full text-primary-500" style={{background: 'linear-gradient(90deg, hsl(var(--info)) 0%, hsl(var(--accent)) 100%)'}}>
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.84375 16H0.84375V0H9.84375V16Z" stroke="#E5E7EB"/>
          <g clipPath="url(#clip0_222_498)">
            <path d="M1.96875 1.5C1.34766 1.5 0.84375 2.00391 0.84375 2.625V12.375C0.84375 12.9961 1.34766 13.5 1.96875 13.5H4.21875V11.625C4.21875 11.0039 4.72266 10.5 5.34375 10.5C5.96484 10.5 6.46875 11.0039 6.46875 11.625V13.5H8.71875C9.33984 13.5 9.84375 12.9961 9.84375 12.375V2.625C9.84375 2.00391 9.33984 1.5 8.71875 1.5H1.96875ZM2.34375 7.125C2.34375 6.91875 2.5125 6.75 2.71875 6.75H3.46875C3.675 6.75 3.84375 6.91875 3.84375 7.125V7.875C3.84375 8.08125 3.675 8.25 3.46875 8.25H2.71875C2.5125 8.25 2.34375 8.08125 2.34375 7.875V7.125ZM4.96875 6.75H5.71875C5.925 6.75 6.09375 6.91875 6.09375 7.125V7.875C6.09375 8.08125 5.925 8.25 5.71875 8.25H4.96875C4.7625 8.25 4.59375 8.08125 4.59375 7.875V7.125ZM6.84375 7.125C6.84375 6.91875 7.0125 6.75 7.21875 6.75H7.96875C8.175 6.75 8.34375 6.91875 8.34375 7.125V7.875C8.34375 8.08125 8.175 8.25 7.96875 8.25H7.21875C7.0125 8.25 6.84375 8.08125 6.84375 7.875V7.125ZM2.71875 3.75H3.46875C3.675 3.75 3.84375 3.91875 3.84375 4.125V4.875C3.84375 5.08125 3.675 5.25 3.46875 5.25H2.71875C2.5125 5.25 2.34375 5.08125 2.34375 4.875V4.125C2.34375 3.91875 2.5125 3.75 2.71875 3.75ZM4.59375 4.125C4.59375 3.91875 4.7625 3.75 4.96875 3.75H5.71875C5.925 3.75 6.09375 3.91875 6.09375 4.125V4.875C6.09375 5.08125 5.925 5.25 5.71875 5.25H4.96875C4.7625 5.25 4.59375 5.08125 4.59375 4.875V4.125ZM7.21875 3.75H7.96875C8.175 3.75 8.34375 3.91875 8.34375 4.125V4.875C8.34375 5.08125 8.175 5.25 7.96875 5.25H7.21875C7.0125 5.25 6.84375 5.08125 6.84375 4.875V4.125C6.84375 3.91875 7.0125 3.75 7.21875 3.75Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_222_498">
              <path d="M0.84375 1.5H9.84375V13.5H0.84375V1.5Z" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col items-start gap-3 ml-2 mb-4">
        <Typography variant="h1" className="text-3xl font-bold">
          {title}
        </Typography>
        <span className="inline-flex items-center gap-1 rounded-md bg-background text-xs font-medium px-2 py-0.5">
          {status}
        </span>
      </div>
    </header>
  );
};

export default SettingsHeader;
