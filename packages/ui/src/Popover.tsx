import React, { useState, useRef, useEffect } from 'react';
import { cn } from './utils';
import { createPortal } from 'react-dom';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  className,
  contentClassName,
  disabled = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (disabled) return;
    
    const newOpen = !isOpen;
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      contentRef.current &&
      !contentRef.current.contains(event.target as Node)
    ) {
      if (!isControlled) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
    }
  };

  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollTop - contentRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left + scrollLeft - contentRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
    }

    // Ensure popover stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width - 8;
    if (top < 0) top = 8;
    if (top + contentRect.height > viewportHeight) top = viewportHeight - contentRect.height - 8;

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, placement]);

  return (
    <div className={cn('relative inline-block', className)}>
      <div ref={triggerRef} onClick={handleToggle}>
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div
          ref={contentRef}
          className={cn(
            'fixed z-50 animate-in fade-in-0 zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2',
            contentClassName
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          data-side={placement}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
};
