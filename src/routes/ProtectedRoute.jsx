import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

import { AppLayout } from '../layouts/AppLayout';

const ProtectedRoute = ({ children, requireAdmin = false, forbidAdmin = false }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but remember where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    // Prevent standard users from accessing admin routes
    return <Navigate to="/" replace />;
  }

  if (forbidAdmin && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')) {
    // Prevent admins from accessing user routes (e.g., /vehicles, /request-parking)
    return <Navigate to="/admin" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default ProtectedRoute;
