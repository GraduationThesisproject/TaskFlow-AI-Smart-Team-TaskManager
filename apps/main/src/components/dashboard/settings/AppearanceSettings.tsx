import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography, ColorPicker, Badge, Separator } from '@taskflow/ui';
import { Palette, Sun, Moon, Monitor, Sparkles, Eye } from 'lucide-react';
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
  };

  const handleDark = () => {
    localStorage.setItem(storageKey, 'dark');
    setTheme('dark');
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

  const themeOptions = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
      gradient: 'from-yellow-400 to-orange-500',
      active: !isSystem && theme === 'light'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes',
      icon: Moon,
      gradient: 'from-slate-700 to-slate-900',
      active: !isSystem && theme === 'dark'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follows your OS preference',
      icon: Monitor,
      gradient: 'from-blue-500 to-purple-600',
      active: isSystem
    }
  ];

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Theme Selection</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground mt-1">
                Choose your preferred theme and appearance
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Theme Options */}
          <div className="space-y-4">
            <div>
              <Typography variant="body-medium" className="font-medium mb-2">Theme Mode</Typography>
              <Typography variant="body-small" className="text-muted-foreground mb-6">
                Select how TaskFlow should appear to you
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                      option.active
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                    onClick={() => {
                      if (option.id === 'light') handleLight();
                      else if (option.id === 'dark') handleDark();
                      else if (option.id === 'system') handleSystem();
                    }}
                  >
                    {/* Active indicator */}
                    {option.active && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Icon with gradient background */}
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <Typography variant="body-medium" className="font-semibold">
                        {option.name}
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        {option.description}
                      </Typography>
                    </div>
                    
                    {/* Active badge */}
                    {option.active && (
                      <Badge variant="secondary" className="absolute top-4 right-4">
                        Active
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Accent Color */}
          <div className="space-y-4">
            <div>
              <Typography variant="body-medium" className="font-medium mb-2">Accent Color</Typography>
              <Typography variant="body-small" className="text-muted-foreground mb-6">
                Customize the primary color used throughout the interface
              </Typography>
            </div>
            
            <div className="p-6 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Typography variant="body-medium" className="font-medium">Color Picker</Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Click to select your preferred accent color
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <ColorPicker
                  onChange={(color) => setUserPrimaryColor(color)}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg border-2 border-border"
                    style={{ backgroundColor: userPrimaryColor || 'hsl(var(--primary))' }}
                  />
                  <Typography variant="body-small" className="text-muted-foreground">
                    Current
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
