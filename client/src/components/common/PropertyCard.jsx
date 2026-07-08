import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Bath, Square, MapPin, Eye, Star } from 'lucide-react';
import Badge from './Badge';

export default function PropertyCard({ property }) {
 if (!property) return null;

 const { 
 _id, title, price, type, status, 
 bedrooms, bathrooms, sqft, images, 
 address, views, isFeatured 
 } = property;

 // Formatting helpers
 const formattedPrice = new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 maximumFractionDigits: 0
 }).format(price || 0);

 const mainImage = images && images.length > 0 ? (images[0]?.url || images[0]) : null;

 // Determine badge variant based on status
 const getStatusVariant = (status) => {
 switch(status?.toLowerCase()) {
 case 'available': return 'success';
 case 'sold': return 'error';
 case 'pending': return 'warning';
 default: return 'default';
 }
 };

 return (
 <motion.div 
 whileHover={{ y: -8, scale: 1.02 }} 
 whileTap={{ scale: 0.98 }}
 className="group relative flex flex-col rounded-2xl bg-surface shadow-lg overflow-hidden border border-outline-variant transition-all hover:shadow-2xl duration-500 interactive"
 >
 {/* Image Container */}
 <div className="relative h-64 w-full overflow-hidden bg-surface-dim shrink-0">
 {mainImage ? (
 <img loading="lazy" decoding="async" 
 src={mainImage} 
 alt={title} 
 className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
 />
) : (
 <div className="flex h-full w-full items-center justify-center text-on-surface-variant font-medium text-sm tracking-widest uppercase">
 No Image
 </div>
)}
 
 {/* Badges */}
 <div className="absolute top-4 left-4 flex flex-col gap-2">
 {isFeatured && (
 <div className="flex items-center gap-1 bg-surface text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-outline-variant/30">
 <Star className="h-3 w-3 fill-current" />
 Featured
 </div>
)}
 {status && (
 <Badge label={status} variant={getStatusVariant(status)} className="shadow-sm border border-outline-variant/30 backdrop-blur-sm" />
)}
 </div>

 <div className="absolute top-4 right-4 bg-surface px-2.5 py-1 rounded-full text-xs font-bold text-on-surface-variant flex items-center gap-1 shadow-sm border border-outline-variant/30">
 <Eye className="h-3.5 w-3.5" />
 {views || 0}
 </div>
 
 <div className="absolute bottom-4 right-4 bg-surface px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-primary shadow-sm border border-outline-variant/30">
 {type}
 </div>
 </div>

 {/* Content Container */}
 <div className="flex flex-col flex-1 p-6">
 <div className="flex justify-between items-start mb-3">
 <h3 className="text-2xl font-serif font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
 {title}
 </h3>
 </div>
 
 <p className="text-xl font-extrabold text-on-surface mb-4">
 {formattedPrice}
 </p>

 {address && (
 <div className="flex items-center text-on-surface-variant font-medium text-sm mb-5 line-clamp-1">
 <MapPin className="h-4 w-4 mr-1.5 shrink-0 text-primary" />
 <span>{typeof address === 'string' ? address : `${address.city}, ${address.state}`}</span>
 </div>
)}

 {/* Specs */}
 <div className="flex items-center gap-5 text-on-surface-variant font-medium text-sm border-t border-outline-variant/30 pt-5 mt-auto">
 <div className="flex items-center gap-2" title="Bedrooms">
 <BedDouble className="h-4 w-4 text-primary" />
 <span>{bedrooms || 0}</span>
 </div>
 <div className="flex items-center gap-2" title="Bathrooms">
 <Bath className="h-4 w-4 text-primary" />
 <span>{bathrooms || 0}</span>
 </div>
 <div className="flex items-center gap-2" title="Square Footage">
 <Square className="h-4 w-4 text-primary" />
 <span>{sqft || 0} sqft</span>
 </div>
 </div>

 {/* Action Link (Full Area Overlay logic optional, we use explicit link for a11y) */}
 <Link to={`/properties/${_id}`} className="absolute inset-0 z-10">
 <span className="sr-only">View Details for {title}</span>
 </Link>
 </div>
 </motion.div>
);
}
