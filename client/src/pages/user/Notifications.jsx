import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
 fetchNotifications, markAsRead, markAllAsRead, deleteNotification 
} from '../../features/notification/notificationSlice';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 Bell, Handshake, Building, Sparkles, Info, CheckCircle2, 
 Trash2, ExternalLink, Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';

const ICON_MAP = {
 deal: <Handshake size={20} className="text-blue-500" />,
 property: <Building size={20} className="text-purple-500" />,
 ai: <Sparkles size={20} className="text-pink-500" />,
 system: <Info size={20} className="text-on-surface-variant" />
};

export default function Notifications() {
 const dispatch = useDispatch();
 const { notifications, loading } = useSelector(state => state.notification);
 
 const [filter, setFilter] = useState('all'); // all, unread, deal, property

 useEffect(() => {
 dispatch(fetchNotifications());
 }, [dispatch]);

 // Apply filters
 const filteredNotifications = notifications.filter(notif => {
 if (filter === 'unread') return !notif.read;
 if (filter === 'deal') return notif.type === 'deal';
 if (filter === 'property') return notif.type === 'property';
 return true;
 });

 const handleMarkAsRead = (id) => {
 dispatch(markAsRead(id));
 };

 const handleDelete = (id) => {
 dispatch(deleteNotification(id));
 };

 const handleMarkAllAsRead = () => {
 dispatch(markAllAsRead());
 };

 return (
 <PageTransition className="bg-surface-dim min-h-screen py-10 px-4 transition-colors duration-200">
 <div className="max-w-4xl mx-auto">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-outline-variant/50 pb-6">
 <div>
 <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
 <Bell className="text-primary" size={32} /> Notifications Center
 </h1>
 <p className="mt-2 text-on-surface-variant font-medium">
 Manage all your alerts, messages, and AI updates in one place.
 </p>
 </div>
 {notifications.some(n => !n.read) && (
 <button 
 onClick={handleMarkAllAsRead}
 className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-primary font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shrink-0"
 >
 <CheckCircle2 size={18} /> Mark All as Read
 </button>
)}
 </div>

 {/* Filters */}
 <div className="flex flex-wrap gap-2 mb-8 bg-surface p-2 rounded-2xl shadow-sm border border-outline-variant/30 w-fit">
 {[
 { id: 'all', label: 'All Alerts' },
 { id: 'unread', label: 'Unread' },
 { id: 'deal', label: 'Deals' },
 { id: 'property', label: 'Properties' },
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setFilter(tab.id)}
 className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
 filter === tab.id 
 ? 'bg-gray-900 dark:bg-white text-white shadow-md' 
 : 'text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant'
 }`}
 >
 {tab.label}
 </button>
))}
 </div>

 {/* List Container */}
 <motion.div 
 initial="hidden"
 animate="visible"
 variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
 className="space-y-4"
 >
 {loading && notifications.length === 0 ? (
 Array(5).fill(0).map((_, i) => (
 <div key={i} className="bg-surface rounded-3xl p-6 border border-outline-variant/30">
 <div className="flex gap-4 items-center">
 <Skeleton circle width={48} height={48} className="dark:bg-surface-variant shrink-0" />
 <div className="flex-1">
 <Skeleton height={20} width="40%" className="dark:bg-surface-variant mb-2" />
 <Skeleton height={14} width="100%" className="dark:bg-surface-variant" />
 </div>
 </div>
 </div>
))
) : filteredNotifications.length > 0 ? (
 filteredNotifications.map((notif) => (
 <motion.div 
 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
 key={notif._id} 
 className={`bg-surface rounded-3xl p-5 sm:p-6 shadow-sm border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative overflow-hidden group ${
 notif.read 
 ? 'border-outline-variant/30' 
 : 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-900/10 shadow-blue-100/50 dark:shadow-none'
 }`}
 >
 {/* Unread indicator bar */}
 {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>}
 
 {/* Icon */}
 <div className="w-14 h-14 rounded-2xl bg-surface-variant border border-outline-variant/50 flex items-center justify-center shrink-0 shadow-inner">
 {ICON_MAP[notif.type] || ICON_MAP.system}
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 {!notif.read && <Circle size={10} className="fill-blue-500 text-blue-500 shrink-0" />}
 <h3 className={`text-lg truncate pr-4 ${!notif.read ? 'font-black text-on-surface' : 'font-bold text-on-surface-variant'}`}>
 {notif.title}
 </h3>
 </div>
 <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
 {notif.message}
 </p>
 <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
 <span>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
 <span className={
 notif.type === 'deal' ? 'text-blue-500' :
 notif.type === 'property' ? 'text-purple-500' :
 notif.type === 'ai' ? 'text-pink-500' : 'text-on-surface-variant'
 }>{notif.type}</span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
 {notif.link && (
 <Link 
 to={notif.link}
 onClick={() => !notif.read && handleMarkAsRead(notif._id)}
 className="px-4 py-2 bg-gray-900 dark:bg-white text-white text-xs font-bold rounded-lg hover:shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2 flex-1 justify-center sm:flex-none"
 >
 View <ExternalLink size={14} />
 </Link>
)}
 <div className="flex items-center gap-1 sm:mt-2">
 {!notif.read && (
 <button 
 onClick={() => handleMarkAsRead(notif._id)}
 className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
 title="Mark as read"
 >
 <CheckCircle2 size={18} />
 </button>
)}
 <button 
 onClick={() => handleDelete(notif._id)}
 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
 title="Delete notification"
 >
 <Trash2 size={18} />
 </button>
 </div>
 </div>
 </motion.div>
))
) : (
 <div className="bg-surface rounded-3xl p-16 text-center border-2 border-dashed border-outline-variant/50">
 <div className="w-20 h-20 mx-auto bg-surface-variant rounded-full flex items-center justify-center mb-6">
 <Bell size={40} className="text-gray-300 dark:text-on-surface-variant" />
 </div>
 <h3 className="text-xl font-bold text-on-surface mb-2">
 {filter !== 'all' ? `No ${filter} notifications` :"You're all caught up!"}
 </h3>
 <p className="text-on-surface-variant font-medium">When you get updates about deals or properties, they'll show up here.</p>
 </div>
)}
 </motion.div>

 </div>
 </PageTransition>
);
}
