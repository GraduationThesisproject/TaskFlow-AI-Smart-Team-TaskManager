import React from 'react';
import { Link } from 'react-router-dom';
import { useRoutePermissions } from '../../hooks/useRoutePermissions';
import type { ProtectedLinkProps } from '../../types/interfaces/ui';

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
