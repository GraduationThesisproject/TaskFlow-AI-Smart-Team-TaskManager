import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography } from '@taskflow/ui';
import { Palette } from 'lucide-react';

const AppearanceSettings: React.FC = () => {
  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.18)] transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5" />
          <CardTitle>Appearance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Typography variant="body-medium" className="font-medium mb-2">Theme</Typography>
          <Typography variant="caption" className="text-muted-foreground mb-3 block">Choose your preferred theme</Typography>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Light</Button>
            <Button variant="outline" size="sm">Dark</Button>
            <Button variant="outline" size="sm">System</Button>
          </div>
        </div>
        <div>
          <Typography variant="body-medium" className="font-medium mb-2">Accent Color</Typography>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
            <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
            <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
            <div className="w-8 h-8 rounded-full bg-orange-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
