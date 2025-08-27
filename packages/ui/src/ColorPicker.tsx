import React, { useState, useRef, useEffect } from 'react';
import { cn } from './utils';
import { Button } from './Button';
import { Popover } from './Popover';
import { Input } from './Input';
import { Typography } from './Typography';

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  presetColors?: string[];
  allowCustom?: boolean;
}

const defaultPresetColors = [
  '#007ADF', // Primary blue
  '#00E8C6', // Accent cyan
  '#10b981', // Success green
  '#f59e0b', // Warning orange
  '#ef4444', // Error red
  '#3b82f6', // Info blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#64748b', // Slate
  '#6b7280', // Gray
  '#374151', // Dark gray
  '#000000', // Black
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '',
  onChange,
  className,
  disabled = false,
  showLabel = false,
  label = 'Color',
  placeholder = 'Choose color...',
  size = 'default',
  variant = 'default',
  presetColors = defaultPresetColors,
  allowCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [customColor, setCustomColor] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
    setCustomColor(value);
  }, [value]);

  const handleColorSelect = (color: string) => {
    setInputValue(color);
    setCustomColor(color);
    onChange?.(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setInputValue(color);
    onChange?.(color);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setInputValue(color);
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      setCustomColor(color);
      onChange?.(color);
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      setInputValue(customColor);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-2 text-sm';
      case 'lg':
        return 'h-12 px-4 text-base';
      default:
        return 'h-10 px-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-border bg-background hover:bg-muted/50';
      case 'ghost':
        return 'bg-transparent hover:bg-muted/50';
      default:
        return 'border border-border bg-card hover:bg-muted/50';
    }
  };

  const isValidColor = (color: string) => {
    return color.match(/^#[0-9A-Fa-f]{6}$/) !== null;
  };

  return (
    <div className={cn('relative', className)}>
      {showLabel && (
        <Typography variant="small" className="mb-2 block">
          {label}
        </Typography>
      )}
      
      <div className="flex gap-2">
        {/* Color Preview Button */}
        <Popover
          open={isOpen}
          onOpenChange={setIsOpen}
          trigger={
            <Button
              type="button"
              variant="outline"
              size={size}
              disabled={disabled}
              className={cn(
                'relative w-12 p-0 border-2 transition-all duration-200',
                'hover:scale-105 focus:ring-2 focus:ring-primary/20',
                isValidColor(inputValue) ? 'border-foreground/20' : 'border-destructive/50',
                getSizeClasses()
              )}
              style={{
                backgroundColor: isValidColor(inputValue) ? inputValue : 'transparent',
              }}
            >
              <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/20 to-black/20" />
              {!isValidColor(inputValue) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Typography variant="caption" className="text-destructive font-bold">
                    !
                  </Typography>
                </div>
              )}
            </Button>
          }
        >
          <div className="p-4 bg-card border border-border rounded-lg shadow-lg w-80">
            <Typography variant="body-medium" className="mb-3 font-medium">
              Choose Color
            </Typography>
            
            {/* Preset Colors Grid */}
            <div className="mb-4">
              <Typography variant="small" className="mb-2 text-muted-foreground">
                Preset Colors
              </Typography>
              <div className="grid grid-cols-8 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-md border-2 transition-all duration-200',
                      'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50',
                      'shadow-sm hover:shadow-md',
                      inputValue === color ? 'border-foreground ring-2 ring-primary' : 'border-border'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            {allowCustom && (
              <div className="space-y-2">
                <Typography variant="small" className="text-muted-foreground">
                  Custom Color
                </Typography>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-12 h-10 p-1 border border-border rounded cursor-pointer"
                    title="Choose custom color"
                  />
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#000000"
                    className="flex-1"
                    maxLength={7}
                  />
                </div>
                {!isValidColor(inputValue) && inputValue && (
                  <Typography variant="caption" className="text-destructive">
                    Please enter a valid hex color (e.g., #007ADF)
                  </Typography>
                )}
              </div>
            )}
          </div>
        </Popover>

        {/* Text Input */}
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 transition-all duration-200',
            getSizeClasses(),
            getVariantClasses(),
            'focus:ring-2 focus:ring-primary/20 focus:border-primary',
            !isValidColor(inputValue) && inputValue && 'border-destructive focus:border-destructive'
          )}
        />
      </div>
    </div>
  );
};

// Export a simpler version for basic use cases
export const SimpleColorPicker: React.FC<Omit<ColorPickerProps, 'showLabel' | 'label'>> = (props) => (
  <ColorPicker {...props} showLabel={false} />
);

// Export a compact version
export const CompactColorPicker: React.FC<Omit<ColorPickerProps, 'size'>> = (props) => (
  <ColorPicker {...props} size="sm" />
);
