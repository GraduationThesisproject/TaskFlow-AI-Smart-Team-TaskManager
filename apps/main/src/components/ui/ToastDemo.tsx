import React from 'react';
import { useToast } from '../../hooks/useToast';

export const ToastDemo: React.FC = () => {
  const toast = useToast();

  const showSuccessToast = () => {
    toast.success('This is a success message!', 'Success');
  };

  const showErrorToast = () => {
    toast.error('Something went wrong!', 'Error');
  };

  const showWarningToast = () => {
    toast.warning('Please be careful!', 'Warning');
  };

  const showInfoToast = () => {
    toast.info('Here is some information.', 'Info');
  };

  const showLoadingToast = () => {
    const id = toast.loading('Processing your request...', 'Loading');
    
    // Simulate completion after 3 seconds
    setTimeout(() => {
      toast.update(id, {
        title: 'Completed',
        description: 'Your request has been processed successfully!',
        variant: 'success'
      });
    }, 3000);
  };

  const showCustomToast = () => {
    toast.success('Custom duration toast', 'Custom', { duration: 10000 });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toast Notification Demo</h2>
      <p className="text-muted-foreground">
        Click the buttons below to test different toast types
      </p>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Success Toast
        </button>
        
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Error Toast
        </button>
        
        <button
          onClick={showWarningToast}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          Warning Toast
        </button>
        
        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Info Toast
        </button>
        
        <button
          onClick={showLoadingToast}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Loading Toast
        </button>
        
        <button
          onClick={showCustomToast}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Custom Duration
        </button>
      </div>
    </div>
  );
};
