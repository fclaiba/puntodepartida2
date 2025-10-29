import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { UserRole } from '../../data/adminData';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, currentUser } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (requiredRole && currentUser) {
      const roleHierarchy: Record<UserRole, number> = {
        'lector': 1,
        'editor': 2,
        'admin': 3
      };

      if (roleHierarchy[currentUser.role] < roleHierarchy[requiredRole]) {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, currentUser, requiredRole, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && currentUser) {
    const roleHierarchy: Record<UserRole, number> = {
      'lector': 1,
      'editor': 2,
      'admin': 3
    };

    if (roleHierarchy[currentUser.role] < roleHierarchy[requiredRole]) {
      return null;
    }
  }

  return <>{children}</>;
};
