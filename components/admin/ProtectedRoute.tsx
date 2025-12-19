import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { UserRole } from '../../data/adminData';
import { PageLoader } from '../LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  lector: 1,
  editor: 2,
  admin: 3,
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, currentUser, isAuthLoading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const hasRequiredRole = useMemo(() => {
    if (!requiredRole) {
      return true;
    }

    if (!currentUser) {
      return false;
    }

    return ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[requiredRole];
  }, [currentUser, requiredRole]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/panel/login', {
        replace: true,
        state: { from: location },
      });
      return;
    }

    if (!hasRequiredRole) {
      navigate('/panel', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, hasRequiredRole, location, navigate]);

  if (isAuthLoading || !isAuthenticated || !hasRequiredRole) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
