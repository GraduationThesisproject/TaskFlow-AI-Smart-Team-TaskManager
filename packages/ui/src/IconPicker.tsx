import React, { useState } from 'react';
import { cn } from './utils';
import { Button } from './Button';
import { Popover } from './Popover';
import { Input } from './Input';
import { Typography } from './Typography';

export interface IconPickerProps {
  value?: string | null;
  onChange?: (icon: string | null) => void;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  allowCustom?: boolean;
  allowNone?: boolean;
}

// Common icons for columns and UI elements
const defaultIcons = [
  '📋', '📝', '✅', '⏳', '🚀', '🎯', '💡', '🔥', '⭐', '💎',
  '📊', '📈', '📉', '🎨', '🔧', '⚙️', '🔍', '📌', '📍', '🎪',
  '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎗️', '🎟️', '🎫', '🎭',
  '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸', '🎺', '🎻',
  '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📷', '📹', '🎥', '📺',
  '📻', '🔊', '🔉', '🔈', '🔇', '📢', '📣', '🔔', '🔕', '🎵',
  '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔', '📒', '📃',
  '📄', '📜', '📋', '📁', '📂', '🗂️', '📁', '📂', '🗄️', '🗃️',
  '📦', '📫', '📪', '📬', '📭', '📮', '📯', '📨', '📩', '📧',
  '💌', '📤', '📥', '📦', '📪', '📫', '📬', '📭', '📮', '📯'
];

export const IconPicker: React.FC<IconPickerProps> = ({
  value = null,
  onChange,
  className,
  disabled = false,
  showLabel = false,
  label = 'Icon',
  placeholder = 'Choose icon...',
  size = 'default',
  variant = 'default',
  allowCustom = true,
  allowNone = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customIcon, setCustomIcon] = useState(value || '');

  const handleIconSelect = (icon: string | null) => {
    onChange?.(icon);
    setIsOpen(false);
  };

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const icon = e.target.value;
    setCustomIcon(icon);
    onChange?.(icon || null);
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

  return (
    <div className={cn('relative', className)}>
      {showLabel && (
        <Typography variant="small" className="mb-2 block">
          {label}
        </Typography>
      )}
      
      <div className="flex gap-2">
        {/* Icon Preview Button */}
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
                'flex items-center justify-center',
                getSizeClasses()
              )}
            >
              {value ? (
                <span className="text-lg">{value}</span>
              ) : (
                <span className="text-muted-foreground text-sm">🎨</span>
              )}
            </Button>
          }
        >
          <div className="p-4 bg-card border border-border rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto">
            <Typography variant="body-medium" className="mb-3 font-medium">
              Choose Icon
            </Typography>
            
            {/* None Option */}
            {allowNone && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleIconSelect(null)}
                  className="w-full justify-start"
                >
                  <span className="mr-2">❌</span>
                  No Icon
                </Button>
              </div>
            )}
            
            {/* Preset Icons Grid */}
            <div className="mb-4">
              <Typography variant="small" className="mb-2 text-muted-foreground">
                Preset Icons
              </Typography>
              <div className="grid grid-cols-10 gap-1">
                {defaultIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-md border transition-all duration-200',
                      'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50',
                      'flex items-center justify-center text-lg',
                      value === icon ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary'
                    )}
                    onClick={() => handleIconSelect(icon)}
                    title={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Icon Input */}
            {allowCustom && (
              <div className="space-y-2">
                <Typography variant="small" className="text-muted-foreground">
                  Custom Icon (Emoji)
                </Typography>
                <Input
                  type="text"
                  value={customIcon}
                  onChange={handleCustomIconChange}
                  placeholder="Enter emoji or icon..."
                  className="flex-1"
                  maxLength={10}
                />
                {customIcon && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-lg">{customIcon}</span>
                    <Typography variant="small" className="text-muted-foreground">
                      Preview
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        </Popover>

        {/* Text Input */}
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value || null)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 transition-all duration-200',
            getSizeClasses(),
            getVariantClasses(),
            'focus:ring-2 focus:ring-primary/20 focus:border-primary'
          )}
        />
      </div>
    </div>
  );
};

// Export a simpler version for basic use cases
export const SimpleIconPicker: React.FC<Omit<IconPickerProps, 'showLabel' | 'label'>> = (props) => (
  <IconPicker {...props} showLabel={false} />
);

// Export a compact version
export const CompactIconPicker: React.FC<Omit<IconPickerProps, 'size'>> = (props) => (
  <IconPicker {...props} size="sm" />
);
