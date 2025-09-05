import React from 'react';
import { Typography } from "@taskflow/ui";
import type { WelcomeHeaderProps } from "../../../types/interfaces/ui";

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = () => (
  <div className="mb-6">
    <Typography variant="heading-compact" className="text-xl font-semibold text-center mb-3">
      Welcome to TaskFlow AI
    </Typography>
    <Typography variant="subtitle" className="text-sm text-center mb-6 max-w-2xl mx-auto">
      Your smart team task manager that helps you stay organized and productive
    </Typography>
  </div>
);
