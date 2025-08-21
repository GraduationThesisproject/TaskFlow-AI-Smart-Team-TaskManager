import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Flex, Input } from '@taskflow/ui';
import { useAppSelector, useAppDispatch } from '../../store';
import { selectUserPreferences, updateUser } from '../../store/slices/authSlice';
import { useUserTheme } from '../../hooks/useUserTheme';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSettingsProps {
  className?: string;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const userPreferences = useAppSelector(selectUserPreferences);
  const { applyUserTheme } = useUserTheme();
  
  const [localTheme, setLocalTheme] = useState({
    mode: userPreferences?.theme?.mode || 'system',
    primaryColor: userPreferences?.theme?.primaryColor || '#007ADF',
    accentColor: userPreferences?.theme?.accentColor || '#00E8C6',
  });
  
  const [isDirty, setIsDirty] = useState(false);
  
  // Update local state when user preferences change
  useEffect(() => {
    if (userPreferences?.theme) {
      setLocalTheme({
        mode: userPreferences.theme.mode || 'system',
        primaryColor: userPreferences.theme.primaryColor || '#007ADF',
        accentColor: userPreferences.theme.accentColor || '#00E8C6',
      });
      setIsDirty(false);
    }
  }, [userPreferences]);
  
  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setLocalTheme(prev => ({ ...prev, mode }));
    setIsDirty(true);
  };
  
  const handleColorChange = (type: 'primary' | 'accent', value: string) => {
    setLocalTheme(prev => ({ 
      ...prev, 
      [type === 'primary' ? 'primaryColor' : 'accentColor']: value 
    }));
    setIsDirty(true);
  };
  
  const handleSave = async () => {
    try {
      await dispatch(updateUser({
        preferences: {
          ...userPreferences,
          theme: {
            ...userPreferences?.theme,
            mode: localTheme.mode,
            primaryColor: localTheme.primaryColor,
            accentColor: localTheme.accentColor,
          }
        }
      })).unwrap();
      
      // Apply the new theme immediately
      applyUserTheme();
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update theme preferences:', error);
    }
  };
  
  const handleReset = () => {
    setLocalTheme({
      mode: userPreferences?.theme?.mode || 'system',
      primaryColor: userPreferences?.theme?.primaryColor || '#007ADF',
      accentColor: userPreferences?.theme?.accentColor || '#00E8C6',
    });
    setIsDirty(false);
  };
  
  const themeModeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;
  
  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <Typography variant="h3" className="font-semibold">
            Theme Settings
          </Typography>
        </div>
        
        {/* Theme Mode Selection */}
        <div className="space-y-4">
          <div>
            <Typography variant="body-medium" className="font-medium mb-3">
              Theme Mode
            </Typography>
            <div className="grid grid-cols-3 gap-3">
              {themeModeOptions.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={localTheme.mode === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeModeChange(value)}
                  className="flex items-center gap-2 h-12"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Color Customization */}
          <div className="space-y-4">
            <Typography variant="body-medium" className="font-medium">
              Custom Colors
            </Typography>
            
            {/* Primary Color */}
            <div className="space-y-2">
              <Typography variant="body-small" className="text-muted-foreground">
                Primary Color
              </Typography>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border"
                  style={{ backgroundColor: localTheme.primaryColor }}
                />
                <Input
                  type="color"
                  value={localTheme.primaryColor}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-20 h-10 p-1 border-2 border-border rounded-lg"
                />
                <Input
                  type="text"
                  value={localTheme.primaryColor}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  placeholder="#007ADF"
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Accent Color */}
            <div className="space-y-2">
              <Typography variant="body-small" className="text-muted-foreground">
                Accent Color
              </Typography>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border"
                  style={{ backgroundColor: localTheme.accentColor }}
                />
                <Input
                  type="color"
                  value={localTheme.accentColor}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-20 h-10 p-1 border-2 border-border rounded-lg"
                />
                <Input
                  type="text"
                  value={localTheme.accentColor}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  placeholder="#00E8C6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="space-y-2">
            <Typography variant="body-small" className="text-muted-foreground">
              Preview
            </Typography>
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: localTheme.primaryColor }}
                >
                  T
                </div>
                <Typography variant="body-medium" className="font-semibold">
                  TaskFlow AI
                </Typography>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  style={{ backgroundColor: localTheme.primaryColor, borderColor: localTheme.primaryColor }}
                >
                  Primary Button
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  style={{ borderColor: localTheme.accentColor, color: localTheme.accentColor }}
                >
                  Accent Button
                </Button>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {isDirty && (
            <Flex justify="end" gap="sm" className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </Flex>
          )}
        </div>
      </div>
    </Card>
  );
};
