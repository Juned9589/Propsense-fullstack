import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

export default function RoleRoute({ allowedRoles }) {
 const { user, token, loading } = useSelector((state) => state.auth);

 if (loading) {
 return (
 <div className="flex h-screen items-center justify-center bg-surface-dim">
 <div className="text-on-surface-variant font-bold">Loading...</div>
 </div>
);
 }

 if (!token) {
 return <Navigate to="/login" replace />;
 }

 if (user && !allowedRoles.includes(user.role)) {
 toast.error("Access denied. You don't have permission to view this page.");
 return <Navigate to="/" replace />;
 }

 return <Outlet />;
}
