import React from "react";

interface ProgressCircleProps {
  percent: number; // 0-100
  label?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({ percent, label }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-32 h-32 group">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-muted"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-primary transition-all duration-500 ease-in-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {percent}%
        </span>
        <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {label}
        </span>
      </div>
    </div>
  );
};

export default ProgressCircle;
