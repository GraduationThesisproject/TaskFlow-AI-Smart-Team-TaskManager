import React from 'react';
import { cn } from './utils';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Number of visible text lines
   */
  rows?: number;
  /**
   * Whether to show a character count
   */
  showCharacterCount?: boolean;
  
  /**
   * Maximum number of characters allowed
   */
  maxLength?: number;
  /**
   * Whether to auto-resize the textarea based on content
   */
  autoResize?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    rows = 3, 
    showCharacterCount = false, 
    maxLength,
    autoResize = false,
    onChange,
    value,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCharCount(newValue.length);
      
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      
      onChange?.(e);
    };

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none caret-foreground",
            autoResize && "overflow-hidden",
            className
          )}
          rows={rows}
          maxLength={maxLength}
          onChange={handleChange}
          value={value}
          ref={ref}
          {...props}
        />
        {showCharacterCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground caret-foreground">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea };
