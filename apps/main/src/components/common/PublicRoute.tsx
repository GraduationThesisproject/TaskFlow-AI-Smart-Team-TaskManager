import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard or specified route
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // User is not authenticated, render children (login/signup forms)
  return <>{children}</>;
};
