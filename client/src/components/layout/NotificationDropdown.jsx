import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../features/notification/notificationSlice';
import { 
 Bell, Handshake, Building, Sparkles, Info, CheckCircle2, Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP = {
 deal: <Handshake size={16} className="text-blue-500" />,
 property: <Building size={16} className="text-purple-500" />,
 ai: <Sparkles size={16} className="text-pink-500" />,
 system: <Info size={16} className="text-on-surface-variant" />
};

export default function NotificationDropdown() {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const { notifications, unreadCount, loading } = useSelector(state => state.notification);
 const { user } = useSelector(state => state.auth);
 
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef(null);

 // Fetch notifications if logged in
 useEffect(() => {
 if (user) {
 dispatch(fetchNotifications());
 }
 }, [dispatch, user]);

 // Close dropdown if clicked outside
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleNotificationClick = async (notif) => {
 if (!notif.isRead) {
 await dispatch(markAsRead(notif._id));
 }
 setIsOpen(false);
 if (notif.link) {
 navigate(notif.link);
 }
 };

 const handleMarkAllRead = () => {
 dispatch(markAllAsRead());
 };

 if (!user) return null;

 const displayNotifications = notifications.slice(0, 10); // Show max 10

 return (
 <div className="relative" ref={dropdownRef}>
 {/* Bell Toggle */}
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className="relative p-2 text-on-surface-variant hover:bg-gray-100 dark:hover:bg-surface-variant rounded-full transition-colors"
 >
 <Bell size={24} />
 {unreadCount > 0 && (
 <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
)}
 </button>

 {/* Dropdown Menu */}
 {isOpen && (
 <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
 
 {/* Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30 bg-gray-50/50 /50">
 <h3 className="font-extrabold text-on-surface">Notifications</h3>
 {unreadCount > 0 && (
 <button 
 onClick={handleMarkAllRead}
 className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
 >
 <CheckCircle2 size={14} /> Mark all read
 </button>
)}
 </div>

 {/* List */}
 <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
 {loading && notifications.length === 0 ? (
 <div className="p-8 text-center text-gray-400 text-sm font-medium">Loading...</div>
) : displayNotifications.length > 0 ? (
 displayNotifications.map((notif) => (
 <div 
 key={notif._id}
 onClick={() => handleNotificationClick(notif)}
 className={`flex items-start gap-4 p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-surface-variant/50 ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
 >
 {/* Icon */}
 <div className="shrink-0 w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant/50">
 {ICON_MAP[notif.type] || ICON_MAP.system}
 </div>
 
 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-1">
 <p className={`text-sm truncate pr-2 ${!notif.isRead ? 'font-extrabold text-on-surface' : 'font-semibold text-on-surface-variant'}`}>
 {notif.title}
 </p>
 {!notif.isRead && <Circle size={8} className="fill-blue-500 text-blue-500 shrink-0" />}
 </div>
 <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
 {notif.message}
 </p>
 <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
 {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
 </p>
 </div>
 </div>
))
) : (
 <div className="p-10 text-center flex flex-col items-center">
 <Bell size={40} className="text-gray-300 mb-3" />
 <p className="text-on-surface-variant font-medium">You're all caught up!</p>
 </div>
)}
 </div>

 {/* Footer */}
 <Link 
 to="/profile?tab=notifications" 
 onClick={() => setIsOpen(false)}
 className="block w-full text-center py-3 bg-surface-dim text-xs font-bold text-on-surface-variant hover:text-primary dark:hover:text-blue-400 transition-colors border-t border-outline-variant/30"
 >
 View Notification Settings
 </Link>
 </div>
)}
 </div>
);
}
