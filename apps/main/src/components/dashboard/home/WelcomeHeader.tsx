import React from 'react';
import { Typography } from "@taskflow/ui";
import type { WelcomeHeaderProps } from "../../../types/interfaces/ui";

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = () => (
  <div className="mb-8">
    <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-center mb-6">
      Welcome to TaskFlow AI
    </Typography>
    <Typography variant="body" className="text-lg md:text-xl text-center mb-8 max-w-3xl">
      Your smart team task manager that helps you stay organized and productive
    </Typography>
  </div>
);
