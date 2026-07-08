import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/common/PageTransition';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 Users, Briefcase, UserCircle, Building, FileText, 
 Trash2, ShieldCheck, ArrowRight, Activity
} from 'lucide-react';
import { 
 PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
 BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

// Chart Colors
const PIE_COLORS = {
 pending: '#FBBF24', // yellow-400
 accepted: '#60A5FA', // blue-400
 in_progress: '#A78BFA', // purple-400
 completed: '#34D399', // green-400
 rejected: '#F87171', // red-400
 cancelled: '#9CA3AF' // gray-400
};

export default function AdminDashboard() {
 const navigate = useNavigate();
 const { user } = useSelector(state => state.auth);
 
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 // Enforce Admin Role
 if (user && user.role !== 'admin') {
 toast.error('Unauthorized access. Admins only.');
 navigate('/');
 return;
 }

 fetchDashboardData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [user, navigate]);

 const fetchDashboardData = async () => {
 try {
 const response = await api.get('/dashboard/admin');
 setData(response.data);
 } catch (error) {
 console.error("Failed to fetch admin dashboard data", error);
 toast.error("Failed to load admin dashboard.");
 } finally {
 setLoading(false);
 }
 };

 const handleDeleteUser = async (userId, name) => {
 if (!window.confirm(`Are you sure you want to permanently delete user: ${name}?`)) return;
 
 try {
 await api.delete(`/users/${userId}`);
 toast.success('User deleted successfully.');
 // Remove user from local state to update UI
 setData(prev => ({
 ...prev,
 recentUsers: prev.recentUsers.filter(u => u._id !== userId)
 }));
 } catch (error) {
 toast.error("Failed to delete user.");
 }
 };

 if (loading || !data) {
 return (
 <div className="bg-surface min-h-screen py-10 px-4">
 <div className="max-w-7xl mx-auto space-y-8">
 <Skeleton height={40} width={300} className="bg-surface-variant" />
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
 {Array(5).fill(0).map((_, i) => <Skeleton key={i} height={120} className="rounded-2xl bg-surface-variant" />)}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <Skeleton height={350} className="rounded-2xl bg-surface-variant" />
 <Skeleton height={350} className="rounded-2xl bg-surface-variant" />
 </div>
 <Skeleton height={400} className="rounded-2xl bg-surface-variant" />
 </div>
 </div>
);
 }

 // Backend returns dealsByStatus as aggregation array: [{ _id: 'status', count: N }]
 const pieData = (data.dealsByStatus || []).map(item => ({
 name: (item._id || 'unknown').replace('_', ' ').toUpperCase(),
 value: item.count,
 colorKey: item._id || 'unknown'
 }));

 // Backend doesn't return usersByRole directly — compute from stats
 const barData = [
 { role: 'ADMIN', count: (data.stats?.totalUsers || 0) - (data.stats?.totalAgents || 0) - (data.stats?.totalBuyers || 0) },
 { role: 'AGENT', count: data.stats?.totalAgents || 0 },
 { role: 'BUYER', count: data.stats?.totalBuyers || 0 },
 ];

 return (
 <PageTransition className="bg-surface min-h-screen py-10 px-4 transition-colors duration-200 pb-24">
 <div className="max-w-7xl mx-auto">
 
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
 <div>
 <h1 className="text-3xl font-serif font-bold text-on-surface tracking-tight flex items-center gap-3">
 <ShieldCheck className="text-primary" size={32} /> Admin Control Center
 </h1>
 <p className="text-on-surface-variant font-medium mt-1">Platform overview and management console.</p>
 </div>
 <Link to="/properties" className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-dim border border-outline-variant/50 text-on-surface hover:bg-gray-50 dark:hover:bg-surface-variant font-bold rounded-xl shadow-sm transition-colors">
 View All Properties <ArrowRight size={18} />
 </Link>
 </div>

 {/* ROW 1: 5 STATS CARDS */}
 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
 {[
 { title: 'Total Users', count: data.stats?.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-blue-100 dark:bg-blue-900/30' },
 { title: 'Agents', count: data.stats?.totalAgents, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
 { title: 'Buyers', count: data.stats?.totalBuyers, icon: UserCircle, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
 { title: 'Properties', count: data.stats?.totalProperties, icon: Building, color: 'text-primary', bg: 'bg-primary-container text-on-primary-container' },
 { title: 'Deals', count: data.stats?.totalDeals, icon: FileText, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }
 ].map((stat, i) => (
 <div key={i} className="bg-surface p-5 rounded-2xl shadow-md border border-outline-variant/50">
 <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
 <stat.icon size={20} />
 </div>
 <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{stat.title}</p>
 <h3 className="text-2xl font-black text-on-surface">
 <AnimatedCounter value={stat.count || 0} />
 </h3>
 </div>
))}
 </div>

 {/* ROW 2: CHARTS */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
 
 {/* Deals by Status (Pie) */}
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50">
 <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4">
 <Activity className="text-indigo-500" size={20} />
 <h3 className="text-lg font-bold text-on-surface">Deals by Status</h3>
 </div>
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 innerRadius={70}
 outerRadius={90}
 paddingAngle={5}
 dataKey="value"
 stroke="none"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.colorKey] || '#9CA3AF'} />
))}
 </Pie>
 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Users by Role (Bar) */}
 <div className="bg-surface p-6 rounded-2xl shadow-md border border-outline-variant/50">
 <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/30 pb-4">
 <Users className="text-indigo-500" size={20} />
 <h3 className="text-lg font-bold text-on-surface">User Role Distribution</h3>
 </div>
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
 <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} />
 <Tooltip 
 cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
 />
 <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={60} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* ROW 3: TABLES */}
 <div className="space-y-8">
 
 {/* Recent Users Table */}
 <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/50 overflow-hidden flex flex-col">
 <div className="p-6 border-b border-outline-variant/30">
 <h3 className="text-lg font-bold text-on-surface">Recently Joined Users</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-variant border-b border-outline-variant/30">
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Joined Date</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {data.recentUsers?.map(u => (
 <tr key={u._id} className="border-b border-outline-variant/30 hover:bg-surface-variant transition-colors">
 <td className="p-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container overflow-hidden flex items-center justify-center shrink-0">
 {u.avatar ? <img loading="lazy" decoding="async" src={u.avatar} className="w-full h-full object-cover" /> : <span className="font-bold text-primary">{u.name.charAt(0)}</span>}
 </div>
 <div>
 <p className="font-bold text-on-surface">{u.name}</p>
 <p className="text-xs text-on-surface-variant">{u.email}</p>
 </div>
 </div>
 </td>
 <td className="p-4">
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
 u.role === 'admin' ? 'bg-red-100 text-red-700' :
 u.role === 'agent' ? 'bg-purple-100 text-purple-700' :
 'bg-blue-100 text-blue-700'
 }`}>
 {u.role}
 </span>
 </td>
 <td className="p-4 text-sm font-medium text-on-surface-variant">
 {new Date(u.createdAt).toLocaleDateString()}
 </td>
 <td className="p-4 text-right">
 <button 
 onClick={() => handleDeleteUser(u._id, u.name)}
 disabled={u.role === 'admin'}
 className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
 title={u.role === 'admin' ?"Cannot delete other admins" :"Delete User"}
 >
 <Trash2 size={18} />
 </button>
 </td>
 </tr>
))}
 {(!data.recentUsers || data.recentUsers.length === 0) && (
 <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No recent users found.</td></tr>
)}
 </tbody>
 </table>
 </div>
 </div>

 {/* Recent Properties Table */}
 <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/50 overflow-hidden flex flex-col">
 <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
 <h3 className="text-lg font-bold text-on-surface">Platform Property Feed</h3>
 <Link to="/properties" className="text-sm font-bold text-primary dark:text-indigo-400 hover:underline">View All</Link>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-variant border-b border-outline-variant/30">
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Property</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price / Type</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Agent</th>
 <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {data.recentProperties?.map(prop => (
 <tr key={prop._id} className="border-b border-outline-variant/30 hover:bg-surface-variant transition-colors">
 <td className="p-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-gray-200 bg-surface-variant rounded-lg overflow-hidden shrink-0">
 {prop.images?.[0]?.url ? <img loading="lazy" decoding="async" src={prop.images[0].url} className="w-full h-full object-cover" /> : <Building size={20} className="m-auto mt-3 text-on-surface-variant" />}
 </div>
 <div>
 <Link to={`/properties/${prop._id}`} className="font-bold text-on-surface hover:text-primary line-clamp-1">{prop.title}</Link>
 <p className="text-xs text-on-surface-variant mt-0.5">{prop.address?.city}</p>
 </div>
 </div>
 </td>
 <td className="p-4">
 <p className="font-black text-on-surface">₹{prop.price?.toLocaleString('en-IN')}</p>
 <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mt-1">{prop.type}</p>
 </td>
 <td className="p-4">
 <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
 prop.status === 'sold' ? 'bg-green-100 text-green-700' :
 prop.status === 'under_offer' ? 'bg-purple-100 text-purple-700' :
 'bg-blue-100 text-blue-700'
 }`}>
 {prop.status?.replace('_', ' ')}
 </span>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-gray-200 bg-surface-variant overflow-hidden">
 {prop.agent?.avatar ? <img loading="lazy" decoding="async" src={prop.agent.avatar} className="w-full h-full object-cover" /> : <UserCircle size={16} className="m-auto mt-1 text-on-surface-variant" />}
 </div>
 <span className="text-sm font-medium text-on-surface-variant">{prop.agent?.name}</span>
 </div>
 </td>
 <td className="p-4 text-right">
 {!prop.isApproved ? (
 <button 
 onClick={async () => {
 try {
 const res = await api.post(`/properties/${prop._id}/approve`);
 toast.success("Property approved!");
 // Update local state for instant UI feedback
 setData(prev => ({
 ...prev,
 recentProperties: prev.recentProperties.map(p => 
 p._id === prop._id ? { ...p, isApproved: true } : p
)
 }));
 } catch (e) { toast.error("Failed to approve"); }
 }}
 className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700"
 >
 Approve
 </button>
) : (
 <button 
 onClick={async () => {
 try {
 const res = await api.post(`/properties/${prop._id}/approve`);
 toast.success("Approval revoked");
 // Update local state for instant UI feedback
 setData(prev => ({
 ...prev,
 recentProperties: prev.recentProperties.map(p => 
 p._id === prop._id ? { ...p, isApproved: false } : p
)
 }));
 } catch (e) { toast.error("Failed to revoke"); }
 }}
 className="px-3 py-1 bg-red-600/10 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-600/20"
 >
 Revoke
 </button>
)}
 </td>
 </tr>
))}
 {(!data.recentProperties || data.recentProperties.length === 0) && (
 <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No properties found.</td></tr>
)}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 </div>
 </PageTransition>
);
}
