import React from 'react';
import { ToastProvider, useEnhancedToast } from '../Toast';
import { Button } from '../Button';

// Example of how to integrate toast notifications into your existing app
const AppWithToasts: React.FC = () => {
  return (
    <ToastProvider position="top-right" maxToasts={3}>
      <YourExistingApp />
    </ToastProvider>
  );
};

// Your existing app component
const YourExistingApp: React.FC = () => {
  const toast = useEnhancedToast();

  const handleSave = async () => {
    // Show loading toast
    const loadingId = toast.loading(
      'Saving...',
      'Please wait while we save your changes.',
      { showProgress: true }
    );

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update to success
      toast.update(loadingId, {
        variant: 'success',
        title: 'Saved! ✅',
        description: 'Your changes have been saved successfully.',
        duration: 3000
      });
    } catch (error) {
      // Update to error
      toast.update(loadingId, {
        variant: 'error',
        title: 'Save Failed ❌',
        description: 'Failed to save changes. Please try again.',
        duration: 5000
      });
    }
  };

  const handleDelete = () => {
    toast.warning(
      'Delete Confirmation ⚠️',
      'Are you sure you want to delete this item?',
      { duration: 0 } // No auto-dismiss for important actions
    );
  };

  const handleInfo = () => {
    toast.info(
      'New Feature Available ℹ️',
      'Check out our latest updates in the settings menu.',
      { duration: 4000 }
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your App</h1>
      
      <div className="space-y-2">
        <Button onClick={handleSave} variant="primary">
          Save Changes
        </Button>
        
        <Button onClick={handleDelete} variant="destructive">
          Delete Item
        </Button>
        
        <Button onClick={handleInfo} variant="outline">
          Show Info
        </Button>
      </div>
    </div>
  );
};

export default AppWithToasts;
