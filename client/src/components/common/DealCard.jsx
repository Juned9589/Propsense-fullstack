import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Building, MapPin, Activity } from 'lucide-react';
import Badge from './Badge';

export default function DealCard({ deal }) {
 if (!deal) return null;

 const { 
 _id, property, buyer, agent, 
 status, offeredPrice, timeline, createdAt 
 } = deal;

 // Formatting helpers
 const formattedPrice = new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 maximumFractionDigits: 0
 }).format(offeredPrice || 0);

 const formattedDate = new Intl.DateTimeFormat('en-GB', {
 day: '2-digit',
 month: 'short',
 year: 'numeric'
 }).format(new Date(createdAt || Date.now()));

 // Determine badge variant based on status
 const getStatusVariant = (status) => {
 switch(status?.toLowerCase()) {
 case 'accepted': return 'success';
 case 'rejected': return 'error';
 case 'pending': return 'warning';
 case 'completed': return 'info';
 default: return 'default';
 }
 };

 return (
 <motion.div 
 whileHover={{ scale: 1.02 }} 
 whileTap={{ scale: 0.98 }}
 className="group relative flex flex-col rounded-2xl bg-white shadow-md overflow-hidden border border-outline-variant/30 transition-shadow hover:shadow-xl duration-300 p-5"
 >
 <div className="flex justify-between items-start mb-4">
 <div>
 <h3 className="text-lg font-bold text-on-surface line-clamp-1 mb-1">
 {property?.title || 'Unknown Property'}
 </h3>
 <div className="flex items-center text-on-surface-variant text-sm line-clamp-1">
 <MapPin className="h-4 w-4 mr-1 shrink-0" />
 <span>{property?.address?.city || 'Unknown Location'}</span>
 </div>
 </div>
 <div className="flex flex-col items-end shrink-0 pl-4">
 <p className="text-xl font-extrabold text-primary">
 {formattedPrice}
 </p>
 <Badge label={status || 'Pending'} variant={getStatusVariant(status)} />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-on-surface-variant bg-surface-variant/50 p-3 rounded-xl mb-4">
 <div className="flex items-center gap-2">
 <User className="h-4 w-4 shrink-0 text-gray-400" />
 <span className="truncate">Buyer: {buyer?.name || 'N/A'}</span>
 </div>
 <div className="flex items-center gap-2">
 <Building className="h-4 w-4 shrink-0 text-gray-400" />
 <span className="truncate">Agent: {agent?.name || 'N/A'}</span>
 </div>
 <div className="flex items-center gap-2 col-span-2">
 <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
 <span>Created: {formattedDate}</span>
 </div>
 </div>

 {/* Timeline Progress Preview */}
 {timeline && timeline.length > 0 && (
 <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-auto border-t border-outline-variant/30 pt-3">
 <Activity className="h-3.5 w-3.5 shrink-0" />
 <span className="truncate">Last Update: {timeline[timeline.length - 1]?.event || 'Initiated'}</span>
 </div>
)}

 {/* Action Link */}
 <Link to={`/deals/${_id}`} className="absolute inset-0 z-10">
 <span className="sr-only">View Deal Details</span>
 </Link>
 </motion.div>
);
}
