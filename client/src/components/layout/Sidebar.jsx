import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Building, Users, Settings, Bell, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function Sidebar() {
 const { user } = useSelector((state) => state.auth);
 const dispatch = useDispatch();
 const navigate = useNavigate();

 const handleLogout = () => {
 dispatch(logout());
 toast.success("Logged out successfully");
 navigate('/');
 };
 
 // Links based on role
 const links = user?.role === 'admin' ? [
 { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
 { to: '/properties', icon: Building, label: 'All Properties' },
 { to: '/dashboard/users', icon: Users, label: 'Manage Users' },
 { to: '/notifications', icon: Bell, label: 'Notifications' },
 ] : [
 { to: '/dashboard/agent', icon: LayoutDashboard, label: 'Dashboard' },
 { to: '/properties/create', icon: PlusCircle, label: 'Add Property' },
 { to: '/deals', icon: Building, label: 'My Deals' },
 { to: '/notifications', icon: Bell, label: 'Notifications' },
 ];

 return (
 <aside className="w-64 bg-surface-dim border-r border-outline-variant/50 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
 <div className="p-6">
 <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
 {user?.role === 'admin' ? 'Admin Controls' : 'Agent Menu'}
 </h2>
 <nav className="space-y-2">
 {links.map((link) => (
 <NavLink
 key={link.to}
 to={link.to}
 className={({ isActive }) =>
 `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
 isActive
 ? 'bg-blue-50 dark:bg-blue-900/20 text-primary'
 : 'text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant'
 }`
 }
 >
 <link.icon className="h-5 w-5" />
 {link.label}
 </NavLink>
))}
 </nav>
 </div>
 
 <div className="mt-auto p-6 border-t border-outline-variant/30 space-y-2">
 <NavLink
 to="/profile"
 className={({ isActive }) =>
 `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
 isActive
 ? 'bg-blue-50 dark:bg-blue-900/20 text-primary'
 : 'text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant'
 }`
 }
 >
 <Settings className="h-5 w-5" />
 Settings
 </NavLink>
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
 >
 <LogOut className="h-5 w-5" />
 Log out
 </button>
 </div>
 </aside>
);
}
