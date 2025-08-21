import React, { useState } from 'react';
import { Button, Typography, Flex, Card } from '@taskflow/ui';
import { LogOut, X } from 'lucide-react';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allDevices?: boolean) => void;
  userName?: string;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User',
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutAllDevices, setLogoutAllDevices] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      await onConfirm(logoutAllDevices);
    } catch (err: any) {
      setError(err.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
      if (!error) {
        onClose();
      }
    }
  };

  // Reset error and state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setLogoutAllDevices(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <Typography variant="heading-medium">Logout</Typography>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Typography variant="body-medium" className="mb-4 text-muted-foreground">
          Are you sure you want to log out, <span className="font-medium text-foreground">{userName}</span>?
        </Typography>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={logoutAllDevices}
              onChange={(e) => setLogoutAllDevices(e.target.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <Typography variant="body-small" className="text-muted-foreground">
              Log out from all devices
            </Typography>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <Typography variant="body-small" className="text-red-600 dark:text-red-400">
              {error}
            </Typography>
          </div>
        )}

        <Flex gap="small" className="justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="flex items-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Log out
              </>
            )}
          </Button>
        </Flex>
      </Card>
    </div>
  );
};
