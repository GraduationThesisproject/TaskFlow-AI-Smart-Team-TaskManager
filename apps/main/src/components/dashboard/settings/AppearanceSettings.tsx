import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography, ColorPicker } from '@taskflow/ui';
import { Palette } from 'lucide-react';
import { useTheme, applyTheme } from '@taskflow/theme';

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme, setUserPrimaryColor, userPrimaryColor } = useTheme();
  const storageKey = 'taskflow-theme';
  const [isSystem, setIsSystem] = useState<boolean>(false);

  useEffect(() => {
    // Consider "system" active when there is no explicit saved theme
    setIsSystem(!localStorage.getItem(storageKey));
  }, [theme]);

  const handleLight = () => {
    localStorage.setItem(storageKey, 'light');
    setTheme('light');
    // Pick a pleasant light-friendly gradient
  };

  const handleDark = () => {
    localStorage.setItem(storageKey, 'dark');
    setTheme('dark');
    // Pick a vivid dark-friendly gradient
  };

  const handleSystem = () => {
    // Clear explicit preference and follow OS setting
    localStorage.removeItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = prefersDark ? 'dark' : 'light';
    applyTheme(resolved, userPrimaryColor ?? undefined);
    setTheme(resolved);
    setIsSystem(true);
  };

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
            <Button
              variant={isSystem ? 'outline' : theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={handleLight}
            >
              Light
            </Button>
            <Button
              variant={isSystem ? 'outline' : theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={handleDark}
            >
              Dark
            </Button>
            <Button
              variant={isSystem ? 'default' : 'outline'}
              size="sm"
              onClick={handleSystem}
            >
              System
            </Button>
          </div>
        </div>
        <div>
          <Typography variant="body-medium" className="font-medium mb-2">Accent Color</Typography>
          <ColorPicker
            onChange={(color) => setUserPrimaryColor(color)}
            // presetColors is optional; leaving it undefined uses the component's defaults
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
