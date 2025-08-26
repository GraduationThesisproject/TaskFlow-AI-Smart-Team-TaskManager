import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRoutePermissions } from '../../hooks/useRoutePermissions';
import { ROUTES } from '../../config/routes';

interface NavigationGuardProps {
  children: React.ReactNode;
  routeKey: keyof typeof ROUTES;
  fallback?: React.ReactNode;
  className?: string;
}

export const NavigationGuard: React.FC<NavigationGuardProps> = ({
  children,
  routeKey,
  fallback = null,
  className,
}) => {
  const { getRouteAccess } = useRoutePermissions();
  const location = useLocation();
  const route = ROUTES[routeKey];

  if (!getRouteAccess(routeKey)) {
    return <>{fallback}</>;
  }

  // If children is a Link component, preserve its props
  if (React.isValidElement(children) && children.type === Link) {
    return React.cloneElement(children, {
      ...children.props,
      className: className || children.props.className,
    });
  }

  return <>{children}</>;
};

interface ProtectedLinkProps {
  to: string;
  routeKey: keyof typeof ROUTES;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  onClick?: () => void;
}

export const ProtectedLink: React.FC<ProtectedLinkProps> = ({
  to,
  routeKey,
  children,
  className,
  fallback,
  onClick,
}) => {
  const { getRouteAccess } = useRoutePermissions();

  if (!getRouteAccess(routeKey)) {
    return <>{fallback}</>;
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};
