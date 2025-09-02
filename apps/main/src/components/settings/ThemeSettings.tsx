import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { useTheme } from '@taskflow/theme';
import { useAuth } from '../../hooks/useAuth';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';

const predefinedColors = [
  { name: 'Blue', value: '#007ADF', hsl: '201 100% 44%' },
  { name: 'Purple', value: '#8B5CF6', hsl: '262 83% 58%' },
  { name: 'Green', value: '#10B981', hsl: '160 84% 39%' },
  { name: 'Orange', value: '#F59E0B', hsl: '43 96% 56%' },
  { name: 'Red', value: '#EF4444', hsl: '0 84% 60%' },
  { name: 'Pink', value: '#EC4899', hsl: '330 81% 60%' },
  { name: 'Teal', value: '#14B8A6', hsl: '173 80% 36%' },
  { name: 'Indigo', value: '#6366F1', hsl: '238 83% 77%' },
];

export function ThemeSettings() {
  const { theme, setTheme, setUserPrimaryColor, userPrimaryColor } = useTheme();
  const { user, updateUser } = useAuth();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');

  useEffect(() => {
    if (userPrimaryColor) {
      setSelectedColor(userPrimaryColor);
    } else if (user?.user?.preferences?.primaryColor) {
      setSelectedColor(user.user.preferences.primaryColor);
    }
  }, [userPrimaryColor, user?.user?.preferences?.primaryColor]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(newTheme);
    }
    
    updateUser({
      preferences: {
        ...user?.user?.preferences,
        theme: newTheme,
      }
    });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setUserPrimaryColor(color);
    
    updateUser({
      preferences: {
        ...user?.user?.preferences,
        primaryColor: color,
      }
    });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    setUserPrimaryColor(color);
    
    updateUser({
      preferences: {
        ...user?.user?.preferences,
        primaryColor: color,
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Customize your TaskFlow experience with personalized themes and colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Theme Mode</h3>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleThemeChange('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          {/* Primary Color Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Primary Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={`
                    relative w-12 h-12 rounded-lg border-2 transition-all
                    ${selectedColor === color.value 
                      ? 'border-primary ring-2 ring-primary/20 scale-110' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Custom Color</h3>
            <div className="flex gap-3">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                title="Choose custom color"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#007ADF"
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Preview</h3>
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedColor || '#007ADF' }}
                >
                  T
                </div>
                <span className="font-semibold">TaskFlow AI</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  style={{ backgroundColor: selectedColor || '#007ADF' }}
                >
                  Primary Button
                </Button>
                <Button variant="outline" size="sm">
                  Secondary Button
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
