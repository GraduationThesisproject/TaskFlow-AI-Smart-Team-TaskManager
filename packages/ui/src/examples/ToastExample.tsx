import React, { useState } from 'react';
import { Button } from '../Button';
import { ToastProvider, useEnhancedToast } from '../Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Typography } from '../Typography';

// Example component that uses the toast system
const ToastDemo: React.FC = () => {
  const toast = useEnhancedToast();
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSuccessToast = () => {
    toast.success(
      'Success! ✅',
      'Your action was completed successfully.',
      { duration: 4000 }
    );
  };

  const handleErrorToast = () => {
    toast.error(
      'Error! ❌',
      'Something went wrong. Please try again.',
      { duration: 6000 }
    );
  };

  const handleWarningToast = () => {
    toast.warning(
      'Warning! ⚠️',
      'Please review your input before proceeding.',
      { duration: 5000 }
    );
  };

  const handleInfoToast = () => {
    toast.info(
      'Information ℹ️',
      'Here is some helpful information for you.',
      { duration: 4000 }
    );
  };

  const handleLoadingToast = () => {
    const id = toast.loading(
      'Processing... ⏳',
      'Please wait while we process your request.',
      { showProgress: true }
    );
    setLoadingToastId(id);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Update to success toast
          toast.update(id, {
            variant: 'success',
            title: 'Completed! ✅',
            description: 'Your request has been processed successfully.',
            duration: 3000
          });
          setLoadingToastId(null);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Update progress in toast
    const progressInterval = setInterval(() => {
      if (loadingToastId) {
        toast.update(loadingToastId, { progress });
      }
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  };

  const handleCustomLoadingToast = () => {
    const id = toast.loading(
      'Custom Loading... ⏳',
      'This toast will be manually controlled.',
      { showProgress: true }
    );
    setLoadingToastId(id);
    setProgress(0);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
    if (loadingToastId) {
      toast.update(loadingToastId, { progress: newProgress });
    }
  };

  const completeLoadingToast = () => {
    if (loadingToastId) {
      toast.update(loadingToastId, {
        variant: 'success',
        title: 'Manual Complete! ✅',
        description: 'This toast was manually completed.',
        duration: 3000
      });
      setLoadingToastId(null);
    }
  };

  const removeLoadingToast = () => {
    if (loadingToastId) {
      toast.remove(loadingToastId);
      setLoadingToastId(null);
    }
  };

  const clearAllToasts = () => {
    toast.clear();
    setLoadingToastId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <Typography variant="h1" className="mb-6">
        Toast Notification Examples
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Success Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-success">✅</span>
              Success Toast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="mb-4 text-muted-foreground">
              Green / positive color for successful actions
            </Typography>
            <Button onClick={handleSuccessToast} variant="outline" className="w-full">
              Show Success Toast
            </Button>
          </CardContent>
        </Card>

        {/* Error Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-destructive">❌</span>
              Error Toast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="mb-4 text-muted-foreground">
              Red / danger color for errors and failures
            </Typography>
            <Button onClick={handleErrorToast} variant="outline" className="w-full">
              Show Error Toast
            </Button>
          </CardContent>
        </Card>

        {/* Warning Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-warning">⚠️</span>
              Warning Toast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="mb-4 text-muted-foreground">
              Yellow / orange color for warnings
            </Typography>
            <Button onClick={handleWarningToast} variant="outline" className="w-full">
              Show Warning Toast
            </Button>
          </CardContent>
        </Card>

        {/* Info Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-info">ℹ️</span>
              Info Toast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="mb-4 text-muted-foreground">
              Blue / neutral color for information
            </Typography>
            <Button onClick={handleInfoToast} variant="outline" className="w-full">
              Show Info Toast
            </Button>
          </CardContent>
        </Card>

        {/* Loading Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">⏳</span>
              Loading Toast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="mb-4 text-muted-foreground">
              With spinner and progress indicator
            </Typography>
            <Button onClick={handleLoadingToast} variant="outline" className="w-full">
              Show Auto Loading Toast
            </Button>
          </CardContent>
        </Card>

        {/* Custom Loading Toast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">🎛️</span>
              Custom Loading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Typography variant="body2" className="text-muted-foreground">
              Manually controlled loading toast
            </Typography>
            <Button onClick={handleCustomLoadingToast} variant="outline" className="w-full">
              Show Custom Loading
            </Button>
            
            {loadingToastId && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => updateProgress(Math.max(0, progress - 10))}
                    disabled={progress <= 0}
                  >
                    -10%
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateProgress(Math.min(100, progress + 10))}
                    disabled={progress >= 100}
                  >
                    +10%
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={completeLoadingToast}
                    className="flex-1"
                  >
                    Complete
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={removeLoadingToast}
                    className="flex-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Utility Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={clearAllToasts} variant="destructive">
              Clear All Toasts
            </Button>
            <Typography variant="body2" className="text-muted-foreground self-center">
              Current progress: {progress}%
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrapper component that provides the toast context
export const ToastExample: React.FC = () => {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <ToastDemo />
    </ToastProvider>
  );
};

export default ToastExample;
