import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00E5FF] mb-4" />
        <p className="text-xs font-mono text-slate-400">Verifying Security Token...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
