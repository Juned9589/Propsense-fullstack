import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 Mail, Phone, Calendar, ShieldCheck, MapPin, Building, Send, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';

const PropertyCard = ({ property }) => (
 <motion.div 
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="rounded-2xl bg-white shadow-sm overflow-hidden border border-outline-variant/30 transition-shadow hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900/50 duration-300 group"
 >
 <div className="h-48 bg-surface-variant relative">
 {property.images?.[0]?.url ? <img loading="lazy" decoding="async" src={property.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
 <div className={`absolute top-4 left-4 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase ${property.status === 'sold' ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-900'}`}>
 {property.status?.replace('_', ' ') || 'Available'}
 </div>
 </div>
 <div className="p-5 flex flex-col justify-between h-[160px]">
 <div>
 <h3 className="font-bold text-on-surface line-clamp-1">{property.title}</h3>
 <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1"><MapPin size={14}/>{property.location?.city}</p>
 </div>
 <div className="flex justify-between items-end mt-4">
 <div>
 <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">{property.type}</p>
 <span className="text-xl text-primary font-extrabold">₹{property.price?.toLocaleString('en-IN')}</span>
 </div>
 <Link to={`/properties/${property._id}`} className="px-4 py-2 bg-surface-variant text-on-surface font-bold text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">View</Link>
 </div>
 </div>
 </motion.div>
);

export default function AgentProfile() {
 const { id } = useParams();
 const [agentData, setAgentData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [isContactModalOpen, setIsContactModalOpen] = useState(false);
 const [message, setMessage] = useState('');

 useEffect(() => {
 const fetchAgentProfile = async () => {
 try {
 // The backend should return the agent user object + an array of their properties
 const response = await api.get(`/users/agents/${id}`);
 setAgentData(response.data);
 } catch (error) {
 console.error("Failed to load agent profile", error);
 toast.error("Failed to load agent profile.");
 } finally {
 setLoading(false);
 }
 };
 fetchAgentProfile();
 }, [id]);

 const handleContactAgent = async (e) => {
 e.preventDefault();
 const toastId = toast.loading('Sending message...');
 try {
 // As per spec: POST /api/properties/:id/contact
 // Using a generic property endpoint for agent contact per requirement
 await api.post(`/properties/agent-contact/${id}`, { message });
 toast.success('Message sent successfully! The agent will reach out to you.', { id: toastId });
 setIsContactModalOpen(false);
 setMessage('');
 } catch (error) {
 toast.error('Failed to send message.', { id: toastId });
 }
 };

 if (loading) {
 return (
 <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
 <Skeleton height={250} className="rounded-3xl dark:bg-surface-variant" />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
 {Array(3).fill(0).map((_, i) => <Skeleton key={i} height={350} className="rounded-2xl dark:bg-surface-variant" />)}
 </div>
 </div>
);
 }

 if (!agentData || !agentData.agent) {
 return <div className="text-center py-20 text-on-surface-variant font-bold text-xl">Agent not found.</div>;
 }

 const { agent, listings } = agentData;

 return (
 <PageTransition className="bg-surface-dim min-h-screen py-10 px-4 transition-colors duration-200">
 <div className="max-w-6xl mx-auto">
 
 {/* Agent Bio Card */}
 <div className="bg-surface rounded-3xl p-6 sm:p-10 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden mb-12">
 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-10 translate-x-1/2 -translate-y-1/2 animate-blob"></div>
 
 <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden shrink-0 bg-surface-variant relative z-10">
 {agent.avatar ? (
 <img loading="lazy" decoding="async" src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
) : (
 <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
 {agent.name?.charAt(0)}
 </div>
)}
 </div>
 
 <div className="flex-1 text-center md:text-left relative z-10">
 <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start mb-2">
 <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">{agent.name}</h1>
 <span className="px-3 py-1 bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-blue-100 dark:border-blue-800">
 <ShieldCheck size={14} /> Verified Agent
 </span>
 </div>
 
 <p className="text-on-surface-variant max-w-2xl mt-4 leading-relaxed">
 {agent.bio || `${agent.name} is a premier verified agent on the PropSense platform, specializing in high-value properties and seamless deal closures. Contact them today to find your dream home or list your property.`}
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
 <div className="flex items-center gap-3 text-on-surface-variant bg-surface-dim p-3 rounded-xl border border-outline-variant/30">
 <Phone size={18} className="text-blue-500" /> 
 <span className="font-semibold text-sm">{agent.phone || 'Contact for number'}</span>
 </div>
 <div className="flex items-center gap-3 text-on-surface-variant bg-surface-dim p-3 rounded-xl border border-outline-variant/30">
 <Mail size={18} className="text-blue-500" /> 
 <span className="font-semibold text-sm truncate">{agent.email}</span>
 </div>
 <div className="flex items-center gap-3 text-on-surface-variant bg-surface-dim p-3 rounded-xl border border-outline-variant/30">
 <Calendar size={18} className="text-blue-500" /> 
 <span className="font-semibold text-sm">Joined {new Date(agent.createdAt).getFullYear()}</span>
 </div>
 </div>
 </div>

 <div className="shrink-0 relative z-10 w-full md:w-auto mt-6 md:mt-0">
 <button 
 onClick={() => setIsContactModalOpen(true)}
 className="w-full md:w-auto px-8 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white font-bold rounded-2xl shadow-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
 >
 <Send size={18} /> Contact Agent
 </button>
 </div>
 </div>

 {/* Active Listings Grid */}
 <div className="mb-10">
 <h2 className="text-2xl font-extrabold text-on-surface mb-6 flex items-center gap-2">
 <Building className="text-blue-500" /> 
 Properties Listed by {agent.name.split(' ')[0]}
 </h2>
 
 {listings && listings.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {listings.map(prop => (
 <PropertyCard key={prop._id} property={prop} />
))}
 </div>
) : (
 <div className="bg-surface rounded-3xl p-16 text-center border border-dashed border-outline-variant/50">
 <Building size={48} className="mx-auto mb-4 text-gray-300" />
 <h3 className="text-xl font-bold text-on-surface mb-2">No Active Listings</h3>
 <p className="text-on-surface-variant">This agent doesn't have any public properties listed right now.</p>
 </div>
)}
 </div>

 </div>

 {/* Contact Modal */}
 {isContactModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-surface rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-outline-variant/30 transform scale-100 animate-in zoom-in-95 duration-200">
 <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-surface-variant rounded-full p-1 transition-colors">
 <XCircle size={24} />
 </button>
 
 <div className="mb-6">
 <h2 className="text-2xl font-extrabold text-on-surface">Direct Message</h2>
 <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
 Sending to <span className="font-bold text-on-surface">{agent.name}</span>
 </p>
 </div>
 
 <form onSubmit={handleContactAgent}>
 <div className="mb-6">
 <textarea
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="I'm interested in working with you..."
 rows="5"
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface resize-none"
 required
 />
 </div>
 <button type="submit" className="w-full py-3 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
 <Send size={18} /> Send Message
 </button>
 </form>
 </div>
 </div>
)}
 
 </PageTransition>
);
}
