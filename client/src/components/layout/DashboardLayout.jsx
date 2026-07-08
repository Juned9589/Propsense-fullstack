import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
 return (
 <div className="flex h-[calc(100vh-64px)] overflow-hidden">
 <Sidebar />
 <div className="flex-1 overflow-y-auto bg-surface transition-colors duration-200">
 {children || <Outlet />}
 </div>
 </div>
);
}
