import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute() {
 const { token, loading } = useSelector((state) => state.auth);
 const location = useLocation();

 if (loading) {
 return (
 <div className="flex h-screen items-center justify-center bg-surface-dim">
 <div className="text-on-surface-variant font-bold">Loading...</div>
 </div>
);
 }

 if (!token) {
 // Redirect to login but save the attempted location
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 return <Outlet />;
}
