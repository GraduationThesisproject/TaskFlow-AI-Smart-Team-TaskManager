import React from 'react';
import { Typography, Flex } from '@taskflow/ui';
import { ThemeSettings } from '../components';

export const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Typography variant="h1" className="font-bold mb-2">
            Settings
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground">
            Customize your TaskFlow AI experience
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThemeSettings />
          
          <div className="space-y-6">
            {/* Placeholder for other settings */}
            <div className="p-6 rounded-lg border border-border bg-card">
              <Typography variant="h3" className="font-semibold mb-4">
                Other Settings
              </Typography>
              <Typography variant="body-medium" className="text-muted-foreground">
                More settings coming soon...
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
