import React from "react";

interface ProgressCircleProps {
  percent: number; // 0-100
  label?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({ percent, label }) => {
  const circumference = 2 * Math.PI * 50; // r=50
  const dashoffset = circumference - (circumference * percent) / 100;

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="56" cy="56" r="50" stroke="gray" strokeWidth="8" fill="transparent" />
          <circle
            cx="56"
            cy="56"
            r="50"
            stroke="url(#grad)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            fill="transparent"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
          {percent}%
        </span>
      </div>
      {label && <p className="text-gray-400 text-sm mt-2">{label}</p>}
    </div>
  );
};

export default ProgressCircle;


