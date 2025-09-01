import React from "react";
import { cn } from "@taskflow/ui";
import { useNavigate } from "react-router-dom";

export interface LogoProps {
  variant?: "full" | "icon" | "text" | "minimal";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showTagline?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = "full",
  size = "md",
  className,
  showTagline = true,
  animated = true, // default true for wow effect
}) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
    "2xl": "h-20",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
  };

  const taglineSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
    "2xl": "text-lg",
  };

  /** --- Logo Icon --- */
  const LogoIcon = () => (
    <div
      className={cn(
        "relative flex items-center justify-center",
        iconSizes[size],
        animated &&
          "transition-transform duration-700 group-hover:rotate-3 group-hover:scale-110"
      )}
    >
      {/* Pulsing glow */}
      {animated && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl animate-pulse" />
      )}

      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Gradient with shimmer animation */}
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="50" cy="50" r="40" fill="url(#gradient)" />

        {/* Abstract arcs with shimmer */}
        <path
          d="M30 50a20 20 0 0 1 40 0"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M35 60a15 15 0 0 1 30 0"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M40 68a10 10 0 0 1 20 0"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
      </svg>
    </div>
  );

  /** --- Logo Text --- */
  const LogoText = () => (
    <div
      className={cn(
        "font-extrabold tracking-tight",
        textSizes[size],
        "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
        animated && "transition-transform duration-500 group-hover:scale-105"
      )}
    >
      TaskFlow&nbsp;AI
    </div>
  );

  /** --- Logo Tagline --- */
  const LogoTagline = () => (
    <div
      className={cn(
        "font-medium text-muted-foreground tracking-wide opacity-70",
        taglineSizes[size],
        animated && "transition-opacity duration-500 group-hover:opacity-100"
      )}
    >
      Smart Team Task Manager
    </div>
  );

  /** --- Minimal Logo --- */
  const MinimalLogo = () => (
    <div className="flex items-center space-x-2">
      <LogoIcon />
      <span
        className={cn(
          "font-bold tracking-tight",
          textSizes[size],
          "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        )}
      >
        TF
      </span>
    </div>
  );

  const renderLogo = () => {
    switch (variant) {
      case "icon":
        return <LogoIcon />;
      case "text":
        return (
          <div className="flex flex-col items-start">
            <LogoText />
            {showTagline && <LogoTagline />}
          </div>
        );
      case "minimal":
        return <MinimalLogo />;
      case "full":
      default:
        return (
          <div className="flex items-center space-x-3">
            <LogoIcon />
            <div className="flex flex-col items-start">
              <LogoText />
              {showTagline && <LogoTagline />}
            </div>
          </div>
        );
    }
  };

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/")}
      className={cn(
        "flex items-center cursor-pointer group select-none",
        sizeClasses[size],
        className
      )}
    >
      {renderLogo()}
    </div>
  );
};

export default Logo;
