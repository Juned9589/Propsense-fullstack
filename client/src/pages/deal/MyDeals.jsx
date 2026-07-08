import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import { fetchDeals } from '../../features/deal/dealSlice';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 Clock, CheckCircle, XCircle, FileText, User, ChevronRight, Inbox
} from 'lucide-react';

const STATUS_COLORS = {
 pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
 accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
 in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
 completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
 rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
 cancelled: 'bg-gray-100 text-gray-800 dark:bg-surface-variant '
};

const STATUS_ICONS = {
 pending: <Clock size={14} />,
 accepted: <CheckCircle size={14} />,
 in_progress: <FileText size={14} />,
 completed: <CheckCircle size={14} />,
 rejected: <XCircle size={14} />,
 cancelled: <XCircle size={14} />
};

// Animation Variants
const staggerList = {
 visible: { transition: { staggerChildren: 0.1 } }
};

const cardVariant = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0 }
};

const DealCard = ({ deal, userRole }) => {
 // Role-aware mapping: If you are the buyer, show the agent's info. If you are the agent, show the buyer's info.
 const otherParty = userRole === 'agent' ? deal.buyer : deal.agent;
 const property = deal.property;
 
 // Get the latest timeline event
 const lastEvent = deal.timeline && deal.timeline.length > 0 
 ? deal.timeline[deal.timeline.length - 1] 
 : { description: 'Deal initiated', date: deal.createdAt };

 return (
 <motion.div variants={cardVariant}>
 <Link to={`/deals/${deal._id}`} className="block group">
 <motion.div 
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="bg-surface rounded-2xl p-5 shadow-sm border border-outline-variant/30 hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
 >
 <div className="flex flex-col sm:flex-row gap-5">
 
 {/* Property Thumbnail */}
 <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-surface-variant">
 {property?.images?.[0]?.url ? (
 <img loading="lazy" decoding="async" src={property.images[0].url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
) : (
 <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
)}
 </div>

 {/* Content */}
 <div className="flex-1 flex flex-col justify-between">
 <div>
 <div className="flex justify-between items-start gap-4 mb-2">
 <h3 className="font-extrabold text-lg text-on-surface line-clamp-1">
 {property?.title || 'Unknown Property'}
 </h3>
 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${STATUS_COLORS[deal.status] || STATUS_COLORS.pending}`}>
 {STATUS_ICONS[deal.status]}
 {deal.status?.replace('_', ' ')}
 </div>
 </div>
 
 <div className="flex items-center gap-6 mt-4">
 <div>
 <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Offered Price</p>
 <p className="text-lg font-black text-primary">
 ₹{deal.offeredPrice?.toLocaleString('en-IN')}
 </p>
 </div>
 <div className="hidden sm:block w-px h-10 bg-surface-variant"></div>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
 {otherParty?.avatar ? (
 <img loading="lazy" decoding="async" src={otherParty.avatar} alt={otherParty.name} className="w-full h-full object-cover" />
) : (
 <User size={20} className="text-gray-400" />
)}
 </div>
 <div>
 <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{userRole === 'agent' ? 'Buyer' : 'Agent'}</p>
 <p className="text-sm font-bold text-on-surface truncate max-w-[120px]">
 {otherParty?.name || 'Unknown User'}
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
 <p className="text-sm text-on-surface-variant truncate flex-1">
 <span className="font-semibold text-on-surface mr-2">Latest:</span> 
 {lastEvent.description}
 </p>
 <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
 <ChevronRight size={20} />
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 </Link>
 </motion.div>
);
};

export default function MyDeals() {
 const dispatch = useDispatch();
 const { deals, loading } = useSelector((state) => state.deal);
 const { user } = useSelector((state) => state.auth);
 
 const [activeTab, setActiveTab] = useState('all');

 useEffect(() => {
 dispatch(fetchDeals());
 }, [dispatch]);

 // Filter logic
 const ACTIVE_STATUSES = ['pending', 'accepted', 'in_progress'];
 const CLOSED_STATUSES = ['completed', 'rejected', 'cancelled'];

 const filteredDeals = deals.filter(deal => {
 if (activeTab === 'all') return true;
 if (activeTab === 'active') return ACTIVE_STATUSES.includes(deal.status);
 if (activeTab === 'closed') return CLOSED_STATUSES.includes(deal.status);
 return true;
 });

 return (
 <PageTransition className="bg-surface-dim min-h-screen transition-colors duration-200 py-10 px-4">
 <div className="max-w-5xl mx-auto">
 
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">My Deals</h1>
 <p className="mt-2 text-on-surface-variant font-medium">
 {user?.role === 'agent' 
 ?"Manage offers and track the progress of your property deals." 
 :"Track offers you've made on properties."}
 </p>
 </div>

 {/* Tabs */}
 <div className="flex gap-2 mb-8 bg-surface p-2 rounded-2xl shadow-sm border border-outline-variant/30 w-full sm:w-fit">
 {['all', 'active', 'closed'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
 activeTab === tab 
 ? 'bg-primary text-on-primary text-white shadow-md' 
 : 'text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant'
 }`}
 >
 {tab}
 </button>
))}
 </div>

 {/* Deal List */}
 <motion.div 
 variants={staggerList}
 initial="hidden"
 animate="visible"
 className="space-y-4"
 >
 {loading ? (
 // Skeleton Loaders
 Array(3).fill(0).map((_, i) => (
 <div key={i} className="bg-surface rounded-2xl p-5 border border-outline-variant/30">
 <div className="flex gap-5">
 <Skeleton width={128} height={128} className="rounded-xl dark:bg-surface-variant shrink-0" />
 <div className="flex-1">
 <Skeleton height={28} width="60%" className="dark:bg-surface-variant mb-4" />
 <Skeleton height={20} width="40%" className="dark:bg-surface-variant mb-8" />
 <Skeleton height={16} width="100%" className="dark:bg-surface-variant" />
 </div>
 </div>
 </div>
))
) : filteredDeals.length > 0 ? (
 filteredDeals.map(deal => (
 <DealCard key={deal._id} deal={deal} userRole={user?.role} />
))
) : (
 // Empty State
 <div className="bg-surface rounded-3xl p-16 text-center border-2 border-dashed border-outline-variant/50">
 <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
 <Inbox size={40} />
 </div>
 <h3 className="text-2xl font-extrabold text-on-surface mb-2">No {activeTab !== 'all' ? activeTab : ''} deals found</h3>
 <p className="text-on-surface-variant">
 {user?.role === 'agent' 
 ?"You don't have any offers matching this filter right now."
 :"You haven't made any offers that match this filter."}
 </p>
 </div>
)}
 </motion.div>

 </div>
 </PageTransition>
);
}
