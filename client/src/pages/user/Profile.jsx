import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMe, savePreferences } from '../../features/auth/authSlice';
import { fetchFavorites } from '../../features/property/propertySlice';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 User, Lock, Settings, Heart, UploadCloud, MapPin, 
 ShieldCheck, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';

// Inline MockPropertyCard for Favorites grid
const MockPropertyCard = ({ property }) => (
 <motion.div 
 whileHover={{ scale: 1.02 }} 
 whileTap={{ scale: 0.98 }}
 className="rounded-2xl bg-white shadow-md overflow-hidden border border-outline-variant/30 transition-shadow hover:shadow-xl duration-300"
 >
 <div className="h-48 bg-surface-variant relative">
 {property.images?.[0]?.url ? <img loading="lazy" decoding="async" src={property.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
 <div className="absolute top-4 left-4 bg-white/90 /90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase text-on-surface">
 {property.status?.replace('_', ' ') || 'Available'}
 </div>
 <div className="absolute top-4 right-4 bg-red-500 text-white p-1.5 rounded-full shadow-sm">
 <Heart size={16} className="fill-current" />
 </div>
 </div>
 <div className="p-5">
 <h3 className="font-bold text-on-surface truncate">{property.title}</h3>
 <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1"><MapPin size={14}/>{property.location?.city}</p>
 <div className="mt-4 flex justify-between items-center">
 <span className="text-primary font-extrabold">₹{property.price?.toLocaleString('en-IN')}</span>
 <Link to={`/properties/${property._id}`} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Details</Link>
 </div>
 </div>
 </motion.div>
);

export default function Profile() {
 const dispatch = useDispatch();
 const { user, loading: authLoading } = useSelector(state => state.auth);
 const { favorites, loading: propertyLoading } = useSelector(state => state.property);
 
 const [activeTab, setActiveTab] = useState('settings');
 const fileInputRef = useRef(null);

 // Forms State
 const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
 const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
 
 const [prefsForm, setPrefsForm] = useState({
 description: '',
 budget: '',
 minBedrooms: '',
 propertyTypes: [],
 preferredCities: ''
 });

 const PROPERTY_TYPES = ["apartment","villa","plot","commercial","flat"];

 useEffect(() => {
 if (user) {
 setProfileForm({ name: user.name || '', phone: user.phone || '' });
 if (user.preferences) {
 setPrefsForm({
 description: user.preferences.description || '',
 budget: user.preferences.budget || '',
 minBedrooms: user.preferences.minBedrooms || '',
 propertyTypes: user.preferences.propertyTypes || [],
 preferredCities: user.preferences.preferredCities?.join(', ') || ''
 });
 }
 }
 }, [user]);

 useEffect(() => {
 if (activeTab === 'favorites') {
 dispatch(fetchFavorites());
 }
 }, [activeTab, dispatch]);

 // Avatar Upload
 const handleAvatarUpload = async (e) => {
 const file = e.target.files[0];
 if (!file) return;

 const formData = new FormData();
 formData.append('avatar', file);

 const toastId = toast.loading('Uploading avatar...');
 try {
 await api.post('/users/avatar', formData);
 toast.success('Avatar updated!', { id: toastId });
 dispatch(getMe()); // Refresh user state
 } catch (error) {
 toast.error('Failed to upload avatar.', { id: toastId });
 }
 };

 // Profile Update
 const handleProfileUpdate = async (e) => {
 e.preventDefault();
 try {
 await api.put('/users/profile', profileForm);
 toast.success('Profile updated successfully!');
 dispatch(getMe());
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to update profile.');
 }
 };

 // Password Update
 const handlePasswordUpdate = async (e) => {
 e.preventDefault();
 try {
 await api.put('/auth/change-password', passwordForm);
 toast.success('Password changed successfully!');
 setPasswordForm({ currentPassword: '', newPassword: '' });
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to change password.');
 }
 };

 // Preferences Update
 const handlePrefsUpdate = async (e) => {
 e.preventDefault();
 const formattedData = {
 ...prefsForm,
 preferredCities: prefsForm.preferredCities.split(',').map(c => c.trim()).filter(c => c)
 };
 const result = await dispatch(savePreferences(formattedData));
 if (savePreferences.fulfilled.match(result)) {
 toast.success('Preferences saved!');
 } else {
 toast.error('Failed to save preferences.');
 }
 };

 const handlePrefTypeToggle = (type) => {
 setPrefsForm(prev => ({
 ...prev,
 propertyTypes: prev.propertyTypes.includes(type)
 ? prev.propertyTypes.filter(t => t !== type)
 : [...prev.propertyTypes, type]
 }));
 };

 if (authLoading && !user) {
 return (
 <div className="min-h-screen bg-surface-dim flex items-center justify-center p-10">
 <div className="text-center space-y-4">
 <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
 <p className="text-on-surface-variant font-bold tracking-tight">Authenticating your profile...</p>
 </div>
 </div>
);
 }

 if (!user) {
 return (
 <div className="min-h-screen bg-surface-dim flex items-center justify-center p-10 text-center">
 <div className="max-w-md space-y-6">
 <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
 <User size={40} />
 </div>
 <h2 className="text-2xl font-black text-on-surface">Profile Not Found</h2>
 <p className="text-on-surface-variant font-medium">We couldn't retrieve your profile data. Please try logging in again.</p>
 <Link to="/login" className="inline-block px-8 py-3 bg-primary text-on-primary text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
 Back to Login
 </Link>
 </div>
 </div>
);
 }

 return (
 <PageTransition className="bg-surface-dim min-h-screen py-10 px-4 transition-colors duration-200">
 <div className="max-w-5xl mx-auto">
 
 {/* Header Profile Summary */}
 <div className="bg-surface rounded-3xl p-8 shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row items-center gap-8 mb-8 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
 
 <div className="relative group">
 <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-surface-variant flex items-center justify-center relative z-10">
 {user?.avatar ? (
 <img loading="lazy" decoding="async" src={user.avatar} className="w-full h-full object-cover" />
) : (
 <span className="text-4xl font-bold text-gray-400">
 {user?.name ? user.name.charAt(0) : '?'}
 </span>
)}
 </div>
 <button 
 onClick={() => fileInputRef.current?.click()}
 className="absolute bottom-0 right-0 p-3 bg-primary text-on-primary text-white rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-colors z-20"
 title="Upload Avatar"
 >
 <UploadCloud size={18} />
 </button>
 <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
 </div>

 <div className="text-center sm:text-left relative z-10">
 <div className="flex items-center gap-2 justify-center sm:justify-start">
 <h1 className="text-3xl font-extrabold text-on-surface">{user?.name}</h1>
 {user?.role === 'agent' && <ShieldCheck size={24} className="text-blue-500" title="Verified Agent" />}
 </div>
 <p className="text-on-surface-variant font-medium mt-1">{user?.email}</p>
 <div className="mt-4 inline-block px-4 py-1.5 bg-surface-variant rounded-full text-xs font-bold uppercase tracking-wider text-on-surface-variant shadow-inner">
 Role: <span className={user?.role === 'admin' ? 'text-red-500' : 'text-blue-500'}>{user?.role}</span>
 </div>
 </div>
 </div>

 {/* Tabs & Content */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 
 {/* Sidebar Nav */}
 <div className="lg:col-span-1 space-y-2">
 <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-on-primary text-white shadow-md' : 'bg-surface text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'}`}>
 <User size={18} /> Profile Settings
 </button>
 <button onClick={() => setActiveTab('preferences')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'preferences' ? 'bg-primary text-on-primary text-white shadow-md' : 'bg-surface text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'}`}>
 <Settings size={18} /> AI Preferences
 </button>
 <button onClick={() => setActiveTab('favorites')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'favorites' ? 'bg-primary text-on-primary text-white shadow-md' : 'bg-surface text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'}`}>
 <Heart size={18} /> Favorites Grid
 </button>
 </div>

 {/* Main Content Area */}
 <div className="lg:col-span-3">
 
 {/* TAB 1: Profile Settings */}
 {activeTab === 'settings' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
 
 {/* Basic Info Form */}
 <div className="bg-surface rounded-3xl p-8 shadow-sm border border-outline-variant/30">
 <h2 className="text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Personal Information</h2>
 <form onSubmit={handleProfileUpdate} className="space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Full Name</label>
 <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Phone Number</label>
 <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 </div>
 <div className="pt-2">
 <button type="submit" className="px-6 py-3 bg-gray-900 dark:bg-white text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
 Update Profile
 </button>
 </div>
 </form>
 </div>

 {/* Security Form */}
 <div className="bg-surface rounded-3xl p-8 shadow-sm border border-outline-variant/30">
 <h2 className="text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4 flex items-center gap-2">
 <Lock size={20} className="text-red-500" /> Security
 </h2>
 <form onSubmit={handlePasswordUpdate} className="space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Current Password</label>
 <input type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">New Password</label>
 <input type="password" required minLength="6" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-on-surface" />
 </div>
 </div>
 <div className="pt-2">
 <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform shadow-red-500/20">
 Change Password
 </button>
 </div>
 </form>
 </div>
 </div>
)}

 {/* TAB 2: AI Preferences */}
 {activeTab === 'preferences' && (
 <div className="bg-surface rounded-3xl p-8 shadow-sm border border-outline-variant/30 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="mb-8">
 <h2 className="text-xl font-bold text-on-surface">AI Match Preferences</h2>
 <p className="text-sm text-on-surface-variant mt-1">These details feed the PropSense AI Matcher to find your perfect properties automatically.</p>
 </div>

 <form onSubmit={handlePrefsUpdate} className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Natural Language Description</label>
 <textarea 
 rows="3" value={prefsForm.description} onChange={e => setPrefsForm({...prefsForm, description: e.target.value})} 
 placeholder="e.g. A modern family home with a big backyard, close to top schools..."
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-on-surface resize-none"
 ></textarea>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Max Budget (₹)</label>
 <input type="number" value={prefsForm.budget} onChange={e => setPrefsForm({...prefsForm, budget: e.target.value})} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Minimum Bedrooms</label>
 <input type="number" value={prefsForm.minBedrooms} onChange={e => setPrefsForm({...prefsForm, minBedrooms: e.target.value})} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-on-surface" />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Preferred Cities (comma separated)</label>
 <input 
 type="text" value={prefsForm.preferredCities} onChange={e => setPrefsForm({...prefsForm, preferredCities: e.target.value})} 
 placeholder="Mumbai, Pune, Bangalore"
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-on-surface" 
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-3">Property Types</label>
 <div className="flex flex-wrap gap-3">
 {PROPERTY_TYPES.map(type => (
 <button
 key={type} type="button" onClick={() => handlePrefTypeToggle(type)}
 className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors border ${
 prefsForm.propertyTypes.includes(type)
 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-500 shadow-sm'
 : 'bg-surface text-on-surface-variant border-outline-variant/50 hover:border-purple-300'
 }`}
 >
 {type}
 </button>
))}
 </div>
 </div>

 <div className="pt-6 border-t border-outline-variant/30">
 <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform shadow-purple-500/20 flex items-center gap-2">
 <CheckCircle size={18} /> Save AI Preferences
 </button>
 </div>
 </form>
 </div>
)}

 {/* TAB 3: Favorites Grid */}
 {activeTab === 'favorites' && (
 <div className="animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="mb-6 flex items-center justify-between bg-surface p-6 rounded-3xl shadow-sm border border-outline-variant/30">
 <div>
 <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
 <Heart className="text-red-500 fill-red-500/20" size={24} /> Saved Properties
 </h2>
 </div>
 <span className="font-black text-on-surface-variant text-lg">{favorites.length} saved</span>
 </div>

 {propertyLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {Array(4).fill(0).map((_, i) => (
 <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 bg-surface">
 <Skeleton height={192} className="dark:bg-surface-variant rounded-none" />
 <div className="p-5"><Skeleton count={2} className="dark:bg-surface-variant" /></div>
 </div>
))}
 </div>
) : favorites.length > 0 ? (
 <motion.div 
 initial="hidden"
 animate="visible"
 variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
 className="grid grid-cols-1 md:grid-cols-2 gap-6"
 >
 {favorites.map(prop => (
 <motion.div key={prop._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
 <MockPropertyCard property={prop} />
 </motion.div>
))}
 </motion.div>
) : (
 <div className="bg-surface rounded-3xl p-16 text-center border-2 border-dashed border-outline-variant/50">
 <Heart size={48} className="mx-auto mb-4 text-gray-300" />
 <h3 className="text-xl font-bold text-on-surface mb-2">No favorites yet</h3>
 <p className="text-on-surface-variant mb-6">Start browsing properties and click the heart icon to save them here.</p>
 <Link to="/properties" className="px-6 py-3 bg-gray-900 dark:bg-white text-white font-bold rounded-xl">Browse Properties</Link>
 </div>
)}
 </div>
)}
 
 </div>
 </div>
 </div>
 </PageTransition>
);
}
