import React from 'react';
import { ThemeToggle } from '../ThemeToggle';

export function ThemeToggleExample() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Theme Toggle Examples</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Default Theme Toggle</h3>
          <ThemeToggle />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Small Size</h3>
          <ThemeToggle size="sm" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Large Size</h3>
          <ThemeToggle size="lg" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Outline Variant</h3>
          <ThemeToggle variant="outline" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Ghost Variant</h3>
          <ThemeToggle variant="ghost" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">With Label</h3>
          <ThemeToggle showLabel />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Icon Only</h3>
          <ThemeToggle iconOnly />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Custom Styling</h3>
          <ThemeToggle 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

export default ThemeToggleExample;
