import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button, Typography, Flex, Card } from '@taskflow/ui';

export const NoAccessPage: React.FC = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <Typography variant="heading-large" className="mb-2">
            Access Denied
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </Typography>
        </div>

        <div className="space-y-4">
          <Typography variant="body-small" className="text-muted-foreground">
            You were trying to access: <span className="font-mono text-sm">{from}</span>
          </Typography>

          <Flex direction="column" gap="small" className="mt-6">
            <Link to="/dashboard">
              <Button variant="primary" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </Flex>
        </div>
      </Card>
    </div>
  );
};
