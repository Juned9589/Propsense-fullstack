import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
 Users, Search, Filter, Trash2, Shield, User as UserIcon, 
 MoreVertical, Mail, Calendar, CheckCircle, XCircle, Sparkles, ShieldCheck
} from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import api from '../../api/axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function UserManagement() {
 const { user: currentUser } = useSelector((state) => state.auth);
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterRole, setFilterRole] = useState('all');

 useEffect(() => {
 fetchUsers();
 }, []);

 const fetchUsers = async () => {
 setLoading(true);
 try {
 const response = await api.get('/users');
 setUsers(response.data.users || []);
 } catch (error) {
 console.error("Failed to fetch users", error);
 toast.error("Failed to load users list.");
 } finally {
 setLoading(false);
 }
 };

 const handleDeleteUser = async (userId, name) => {
 if (userId === currentUser?._id) {
 toast.error("You cannot delete your own account.");
 return;
 }
 
 if (!window.confirm(`Are you sure you want to permanently delete user: ${name}?`)) return;
 
 try {
 await api.delete(`/users/${userId}`);
 toast.success('User deleted successfully.');
 setUsers(users.filter(u => u._id !== userId));
 } catch (error) {
 toast.error("Failed to delete user.");
 }
 };

 const handleRoleUpdate = async (userId, newRole) => {
 try {
 await api.patch(`/users/${userId}/role`, { role: newRole });
 toast.success(`Role updated to ${newRole}`);
 fetchUsers();
 } catch (error) {
 toast.error("Failed to update role.");
 }
 };

 const handleStatusToggle = async (userId) => {
 try {
 await api.patch(`/users/${userId}/status`);
 toast.success("User status updated");
 fetchUsers();
 } catch (error) {
 toast.error("Failed to update status.");
 }
 };

 const filteredUsers = users.filter(u => {
 const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
 u.email?.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesRole = filterRole === 'all' || u.role === filterRole;
 return matchesSearch && matchesRole;
 });

 return (
 <PageTransition className="p-4 md:p-8">
 <div className="max-w-7xl mx-auto space-y-8">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h1 className="text-3xl font-black text-on-surface tracking-tight">User Management</h1>
 <p className="text-on-surface-variant mt-1 font-medium">View, filter and manage all registered users in the platform.</p>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="bg-primary text-on-primary/10 text-primary px-4 py-2 rounded-xl border border-blue-600/20 flex items-center gap-2 font-bold text-sm">
 <Users size={18} />
 Total Users: {users.length}
 </div>
 </div>
 </div>

 {/* Filters Section */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="relative group md:col-span-2">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
 <input 
 type="text" 
 placeholder="Search by name or email..." 
 className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-on-surface font-medium shadow-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 
 <div className="relative group">
 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
 <select 
 className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-on-surface font-medium appearance-none shadow-sm cursor-pointer"
 value={filterRole}
 onChange={(e) => setFilterRole(e.target.value)}
 >
 <option value="all">All Roles</option>
 <option value="buyer">Buyers</option>
 <option value="agent">Agents</option>
 <option value="admin">Admins</option>
 </select>
 </div>
 </div>

 {/* Users List Section */}
 <div className="bg-surface rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-dim/50 border-b border-outline-variant/30">
 <th className="p-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User Profile</th>
 <th className="p-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
 <th className="p-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
 <th className="p-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Joined Date</th>
 <th className="p-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
 {loading ? (
 Array(5).fill(0).map((_, i) => (
 <tr key={i}>
 <td className="p-5"><div className="flex gap-3"><Skeleton circle width={40} height={40}/><div className="space-y-1"><Skeleton width={120}/><Skeleton width={80}/></div></div></td>
 <td className="p-5"><Skeleton width={60} height={24} className="rounded-full"/></td>
 <td className="p-5"><Skeleton width={80}/></td>
 <td className="p-5"><Skeleton width={100}/></td>
 <td className="p-5 text-right"><Skeleton width={30} height={30} className="rounded-lg ml-auto"/></td>
 </tr>
))
) : filteredUsers.length > 0 ? (
 filteredUsers.map((u) => (
 <motion.tr 
 key={u._id}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="hover:bg-gray-50/50 dark:hover:bg-surface-variant/20 transition-colors"
 >
 <td className="p-5">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 border-2 border-white">
 {u.avatar?.url ? (
 <img loading="lazy" decoding="async" src={u.avatar.url} className="w-full h-full object-cover" />
) : (
 <span className="font-bold text-white text-lg">{u.name?.charAt(0)}</span>
)}
 </div>
 <div>
 <p className="font-bold text-on-surface leading-tight">{u.name}</p>
 <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1 font-medium">
 <Mail size={12} /> {u.email}
 </div>
 </div>
 </div>
 </td>
 <td className="p-5">
 <select 
 value={u.role}
 onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
 className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer ${
 u.role === 'admin' 
 ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20' 
 : u.role === 'agent'
 ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/20'
 : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20'
 }`}
 disabled={u._id === currentUser?._id}
 >
 <option value="buyer">Buyer</option>
 <option value="agent">Agent</option>
 <option value="admin">Admin</option>
 </select>
 </td>
 <td className="p-5">
 <button 
 onClick={() => handleStatusToggle(u._id)}
 disabled={u._id === currentUser?._id}
 className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
 u.isActive !== false ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
 }`}
 >
 <div className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
 {u.isActive !== false ? 'Active' : 'Banned'}
 </button>
 </td>
 <td className="p-5">
 <div className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant">
 <Calendar size={14} className="text-gray-400" />
 {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
 </div>
 </td>
 <td className="p-5 text-right">
 <div className="flex items-center justify-end gap-2">
 <button 
 onClick={() => handleDeleteUser(u._id, u.name)}
 disabled={u.role === 'admin' && u._id === currentUser?._id}
 className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
 title="Delete User"
 >
 <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
 </button>
 </div>
 </td>
 </motion.tr>
))
) : (
 <tr>
 <td colSpan="5" className="p-20 text-center">
 <div className="flex flex-col items-center gap-4">
 <div className="w-20 h-20 bg-surface-variant rounded-full flex items-center justify-center text-gray-400">
 <Users size={32} />
 </div>
 <div className="space-y-1">
 <p className="text-xl font-bold text-on-surface">No users found</p>
 <p className="text-on-surface-variant font-medium">Try adjusting your search or filters.</p>
 </div>
 </div>
 </td>
 </tr>
)}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </PageTransition>
);
}
