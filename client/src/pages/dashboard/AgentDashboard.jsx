import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/common/PageTransition';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 Eye, Handshake, CheckCircle, TrendingUp, Plus, 
 ArrowRight, MapPin, Building, Calendar
} from 'lucide-react';
import { 
 PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
 BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

// Donut Chart Colors
const COLORS = {
 available: '#3B82F6', // blue-500
 under_offer: '#A855F7', // purple-500
 sold: '#22C55E' // green-500
};

export default function AgentDashboard() {
 const navigate = useNavigate();
 const { user } = useSelector(state => state.auth);
 
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 // Enforce Agent Role
 if (user && user.role !== 'agent' && user.role !== 'admin') {
 navigate('/');
 return;
 }

 const fetchDashboardData = async () => {
 try {
 const response = await api.get('/dashboard/agent');
 setData(response.data);
 } catch (error) {
 console.error("Failed to fetch dashboard data", error);
 } finally {
 setLoading(false);
 }
 };

 fetchDashboardData();
 }, [user, navigate]);

 if (loading || !data) {
 return (
 <div className="bg-surface min-h-screen py-10 px-4">
 <div className="max-w-7xl mx-auto space-y-8">
 <Skeleton height={40} width={250} className="bg-surface-variant" />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {Array(4).fill(0).map((_, i) => <Skeleton key={i} height={140} className="rounded-2xl bg-surface-variant" />)}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <Skeleton height={400} className="rounded-2xl bg-surface-variant" />
 <Skeleton height={400} className="rounded-2xl bg-surface-variant" />
 </div>
 </div>
 </div>
);
 }

 // Prepare chart data
 const pieData = Object.entries(data.listingsByStatus || {}).map(([key, value]) => ({
 name: key.replace('_', ' ').toUpperCase(),
 value,
 colorKey: key
 }));

 return (
 <PageTransition className="bg-surface min-h-screen py-10 px-4 transition-colors duration-200 pb-24">
 <div className="max-w-7xl mx-auto">
 
 {/* Header & Quick Actions */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
 <div>
 <h1 className="text-3xl font-serif font-bold text-on-surface tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
 <p className="text-on-surface-variant font-medium mt-1">Here is what's happening with your properties today.</p>
 </div>
 <div className="flex items-center gap-3 w-full md:w-auto">
 <Link to="/properties/create" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-container hover:text-on-primary-container text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-0.5">
 <Plus size={18} /> New Listing
 </Link>
 <Link to="/deals" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-surface-dim border border-outline-variant/50 text-on-surface hover:bg-gray-50 dark:hover:bg-surface-variant font-bold rounded-xl shadow-sm transition-colors">
 All Deals <ArrowRight size={18} />
 </Link>
 </div>
 </div>

 {/* ROW 1: STATS CARDS */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50 flex items-center gap-5">
 <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
 <Eye size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Views</p>
 <h3 className="text-2xl font-black text-on-surface">
 <AnimatedCounter value={data.stats?.totalViews || 0} />
 </h3>
 </div>
 </div>
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50 flex items-center gap-5">
 <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
 <Handshake size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Active Deals</p>
 <h3 className="text-2xl font-black text-on-surface">
 <AnimatedCounter value={data.stats?.activeDeals || 0} />
 </h3>
 </div>
 </div>
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50 flex items-center gap-5">
 <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center shrink-0">
 <CheckCircle size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Closed Deals</p>
 <h3 className="text-2xl font-black text-on-surface">
 <AnimatedCounter value={data.stats?.closedDeals || 0} />
 </h3>
 </div>
 </div>
 <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 flex items-center gap-5 text-white">
 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
 <TrendingUp size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Revenue</p>
 <h3 className="text-2xl font-black text-white">
 <AnimatedCounter value={data.stats?.revenue || 0} prefix="₹" />
 </h3>
 </div>
 </div>
 </div>

 {/* ROW 2: CHARTS */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
 
 {/* Listings by Status (Donut) */}
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50 lg:col-span-1">
 <h3 className="text-lg font-bold text-on-surface mb-6">Listings by Status</h3>
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={80}
 paddingAngle={5}
 dataKey="value"
 stroke="none"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[entry.colorKey] || '#9CA3AF'} />
))}
 </Pie>
 <Tooltip 
 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="flex justify-center gap-4 mt-2">
 {pieData.map((entry, index) => (
 <div key={index} className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.colorKey] }}></div>
 {entry.name} ({entry.value})
 </div>
))}
 </div>
 </div>

 {/* Revenue Chart (Bar) */}
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50 lg:col-span-2">
 <h3 className="text-lg font-bold text-on-surface mb-6">6-Month Revenue</h3>
 <div className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data.revenueChart || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} dy={10} />
 <YAxis 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }}
 tickFormatter={(value) => `₹${value / 100000}L`}
 />
 <Tooltip 
 cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
 formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
 />
 <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* ROW 3: LISTINGS & DEALS */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 
 {/* Recent Listings */}
 <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/50 overflow-hidden flex flex-col">
 <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
 <h3 className="text-lg font-bold text-on-surface">Recent Listings</h3>
 <Link to="/properties" className="text-sm font-bold text-primary hover:underline">View All</Link>
 </div>
 <div className="flex-1 overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-variant">
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Property</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Views</th>
 </tr>
 </thead>
 <tbody>
 {data.recentListings?.map(listing => (
 <tr key={listing._id} className="border-b border-outline-variant/30 hover:bg-surface-variant transition-colors">
 <td className="p-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gray-200 bg-surface-variant rounded-lg overflow-hidden shrink-0">
 {listing.images?.[0]?.url ? <img loading="lazy" decoding="async" src={listing.images[0].url} className="w-full h-full object-cover" /> : <Building size={20} className="m-auto mt-3 text-on-surface-variant" />}
 </div>
 <div>
 <Link to={`/properties/${listing._id}`} className="font-bold text-on-surface hover:text-primary line-clamp-1">{listing.title}</Link>
 <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5"><MapPin size={12}/> {listing.address?.city}</p>
 </div>
 </div>
 </td>
 <td className="p-4 font-bold text-on-surface">₹{listing.price?.toLocaleString('en-IN')}</td>
 <td className="p-4">
 <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
 listing.status === 'sold' ? 'bg-green-100 text-green-700' :
 listing.status === 'under_offer' ? 'bg-purple-100 text-purple-700' :
 'bg-blue-100 text-blue-700'
 }`}>
 {listing.status?.replace('_', ' ')}
 </span>
 </td>
 <td className="p-4 text-right text-on-surface-variant font-bold">{listing.views || 0}</td>
 </tr>
))}
 {(!data.recentListings || data.recentListings.length === 0) && (
 <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No recent listings found.</td></tr>
)}
 </tbody>
 </table>
 </div>
 </div>

 {/* Recent Deals */}
 <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/50 overflow-hidden flex flex-col">
 <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
 <h3 className="text-lg font-bold text-on-surface">Active Deal Updates</h3>
 <Link to="/deals" className="text-sm font-bold text-primary hover:underline">Manage All</Link>
 </div>
 <div className="p-4 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
 {data.recentDeals?.map(deal => (
 <Link key={deal._id} to={`/deals/${deal._id}`} className="block p-4 rounded-2xl border border-outline-variant/30 bg-surface-variant hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gray-200 bg-surface-variant rounded-full overflow-hidden shrink-0">
 {deal.buyer?.avatar ? <img loading="lazy" decoding="async" src={deal.buyer.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold">{deal.buyer?.name?.charAt(0)}</div>}
 </div>
 <div>
 <p className="font-bold text-on-surface text-sm">{deal.buyer?.name}</p>
 <p className="text-xs text-on-surface-variant">Offer on: {deal.property?.title}</p>
 </div>
 </div>
 <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
 ['completed', 'accepted'].includes(deal.status) ? 'bg-green-100 text-green-700' :
 deal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
 'bg-purple-100 text-purple-700'
 }`}>
 {deal.status?.replace('_', ' ')}
 </div>
 </div>
 <div className="flex justify-between items-center mt-2">
 <p className="text-sm font-black text-primary">₹{deal.offeredPrice?.toLocaleString('en-IN')}</p>
 <p className="text-xs text-on-surface-variant flex items-center gap-1"><Calendar size={12} /> {new Date(deal.updatedAt || deal.createdAt).toLocaleDateString()}</p>
 </div>
 </Link>
))}
 {(!data.recentDeals || data.recentDeals.length === 0) && (
 <div className="p-8 text-center text-on-surface-variant">No recent deals found.</div>
)}
 </div>
 </div>

 </div>
 </div>
 </PageTransition>
);
}
