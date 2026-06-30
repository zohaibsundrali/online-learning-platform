import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} />;
  }

  return children;
};

export default RoleBasedRoute;