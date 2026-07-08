import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function Navbar() {
 const { theme, toggleTheme } = useDarkMode();
 const [isProfileOpen, setIsProfileOpen] = useState(false);
 const dropdownRef = useRef(null);
 
 const dispatch = useDispatch();
 const navigate = useNavigate();
 
 // Safely retrieve states
 const notifications = useSelector((state) => state.notification) || { unreadCount: 0 };
 const auth = useSelector((state) => state.auth) || { user: null };
 
 const { unreadCount } = notifications;
 const { user } = auth;

 const handleLogout = () => {
 setIsProfileOpen(false);
 dispatch(logout());
 navigate('/', { replace: true });
 toast.success("Logged out successfully");
 };

 // Close dropdown on outside click
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsProfileOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
 <nav className="sticky top-0 z-50 w-full border-b border-surface-variant bg-surface/85 backdrop-blur-md shadow-sm transition-all duration-300">
 <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
 {/* Logo & Main Links Section */}
 <div className="flex items-center gap-8">
 <Link to="/" className="flex items-center gap-2 interactive">
 <span className="text-xl font-serif font-bold tracking-tight text-on-surface">
 PropSense
 </span>
 </Link>
 
 {/* Global Navigation Links */}
 <div className="hidden md:flex items-center gap-6">
 <Link to="/properties" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors interactive">
 Properties
 </Link>
 <Link to="/ai" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 interactive">
 AI Tools <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] uppercase tracking-wider font-black">Beta</span>
 </Link>
 </div>
 </div>

 {/* Right Actions */}
 <div className="flex items-center gap-3 md:gap-5">
 {/* Dark Mode Toggle */}
 <button
 onClick={toggleTheme}
 className="rounded-full p-2 text-on-surface-variant hover:bg-surface-variant transition-colors interactive"
 aria-label="Toggle Dark Mode"
 >
 {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
 </button>

 {/* Notification Bell */}
 {user && (
 <div className="relative">
 <Link
 to="/notifications"
 className="rounded-full p-2 text-on-surface-variant hover:bg-surface-variant transition-colors inline-block interactive"
 aria-label="Notifications"
 >
 <Bell size={20} />
 {unreadCount > 0 && (
 <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-on-error">
 {unreadCount > 99 ? '99+' : unreadCount}
 </span>
)}
 </Link>
 </div>
)}

 {/* User Profile / Login */}
 {user ? (
 <div className="relative" ref={dropdownRef}>
 <button 
 onClick={() => setIsProfileOpen(!isProfileOpen)}
 className="flex items-center gap-2 hover:bg-surface-variant p-1 pr-2 rounded-full border border-transparent hover:border-outline-variant transition-all interactive"
 >
 <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant shrink-0">
 <img loading="lazy" decoding="async"
 src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
 alt="User Avatar"
 className="h-full w-full object-cover"
 />
 </div>
 <ChevronDown size={14} className="text-on-surface-variant hidden sm:block" />
 </button>
 {isProfileOpen && (
 <div className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-md rounded-xl shadow-xl border border-outline-variant py-1 z-50 overflow-hidden">
 <div className="px-4 py-3 border-b border-surface-variant bg-surface-dim/50">
 <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
 <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
 <div className="mt-1 flex">
 <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
 {user.role}
 </span>
 </div>
 </div>
 <div className="py-1">
 {/* Show Dashboard link if Agent/Admin */}
 {(user.role === 'agent' || user.role === 'admin') && (
 <Link 
 to={`/dashboard/${user.role}`} 
 onClick={() => setIsProfileOpen(false)} 
 className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-variant interactive"
 >
 Dashboard
 </Link>
)}
 <Link 
 to="/profile" 
 onClick={() => setIsProfileOpen(false)} 
 className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-variant interactive"
 >
 <UserIcon size={16} /> Profile Settings
 </Link>
 </div>
 <div className="border-t border-surface-variant py-1">
 <button 
 onClick={handleLogout} 
 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-error hover:bg-error-container text-left transition-colors interactive"
 >
 <LogOut size={16} /> Log out
 </button>
 </div>
 </div>
)}
 </div>
) : (
 <div className="flex items-center gap-3">
 <Link 
 to="/login" 
 className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors interactive"
 >
 Log in
 </Link>
 <Link 
 to="/register" 
 className="hidden sm:inline-block px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(119,90,25,0.39)] transition-all hover:-translate-y-[2px] interactive"
 >
 Sign up
 </Link>
 </div>
)}
 </div>
 </div>
 </nav>
);
}
