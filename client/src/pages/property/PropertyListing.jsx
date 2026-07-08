import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties, toggleFavorite, fetchFavorites } from '../../features/property/propertySlice';
import toast from 'react-hot-toast';
import { Filter, SlidersHorizontal, MapPin, SearchX, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Animation Variants
const staggerGrid = {
 visible: { transition: { staggerChildren: 0.1 } }
};

const cardVariant = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0 }
};

// Simple inline MockPropertyCard for the grid
const MockPropertyCard = ({ property }) => {
 const dispatch = useDispatch();
 const { user } = useSelector((state) => state.auth);
 const { favoriteIds } = useSelector((state) => state.property);
 const isFavorited = favoriteIds.includes(property._id);

 const handleToggleFavorite = (e) => {
 e.preventDefault();
 e.stopPropagation();
 if (!user) return toast.error("Please log in to save properties.");
 dispatch(toggleFavorite(property._id));
 };

 return (
 <motion.div 
 variants={cardVariant}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="rounded-2xl bg-white shadow-md overflow-hidden border border-outline-variant/30 transition-shadow hover:shadow-xl duration-300 flex flex-col h-full relative"
 >
 <div className="h-56 bg-surface-variant relative">
 {property.images?.[0]?.url ? (
 <img loading="lazy" decoding="async" src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
) : (
 <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
)}
 <div className="absolute top-4 left-4 bg-white/90 /90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-on-surface uppercase tracking-wider">
 {property.status?.replace('_', ' ') || 'Available'}
 </div>
 <button 
 onClick={handleToggleFavorite}
 className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
 isFavorited ?"bg-red-500 text-white" :"bg-white/80 text-gray-400 hover:text-red-500"
 }`}
 >
 <Heart size={18} className={isFavorited ?"fill-current" :""} />
 </button>
 </div>
 <div className="p-6 flex flex-col flex-grow">
 <h3 className="text-xl font-extrabold text-on-surface line-clamp-1">{property.title}</h3>
 <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-1.5 font-medium">
 <MapPin size={16} /> {property.address?.city || 'Location N/A'}
 </p>
 <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-on-surface-variant">
 {property.bedrooms && <span className="bg-surface-variant px-3 py-1.5 rounded-md border border-outline-variant/50">{property.bedrooms} Beds</span>}
 {property.amenities?.slice(0, 2).map((am, i) => (
 <span key={i} className="bg-surface-variant px-3 py-1.5 rounded-md border border-outline-variant/50">{am}</span>
))}
 </div>
 <div className="mt-auto pt-6 flex justify-between items-end">
 <div>
 <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-1">Price</p>
 <span className="text-primary font-black text-2xl">
 ₹{property.price?.toLocaleString('en-IN') || 'Request'}
 </span>
 </div>
 <Link to={`/properties/${property._id}`} className="text-sm font-bold bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md">
 Details
 </Link>
 </div>
 </div>
 </motion.div>
);
};

const AVAILABLE_AMENITIES = ["Parking","Pool","Gym","Security","Garden","Furnished","Balcony"];
const PROPERTY_TYPES = ["apartment","villa","plot","commercial","flat"];

export default function PropertyListing() {
 const dispatch = useDispatch();
 const { properties, total, page: currentPage, loading } = useSelector((state) => state.property);
 const { user } = useSelector((state) => state.auth);
 
 const [filters, setFilters] = useState({
 minPrice: '',
 maxPrice: '',
 bedrooms: '',
 type: '',
 status: '',
 amenities: [],
 radius: '',
 page: 1
 });

 const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

 useEffect(() => {
 dispatch(fetchProperties(filters));
 if (user) dispatch(fetchFavorites());
 }, [dispatch, filters.page, user]); 

 const handleFilterChange = (e) => {
 const { name, value, type, checked } = e.target;
 
 if (type === 'checkbox') {
 setFilters(prev => ({
 ...prev,
 amenities: checked 
 ? [...prev.amenities, value]
 : prev.amenities.filter(a => a !== value),
 page: 1 
 }));
 } else {
 setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
 }
 };

 const applyFilters = (e) => {
 e.preventDefault();
 dispatch(fetchProperties(filters));
 setIsMobileFiltersOpen(false);
 };

 const clearFilters = () => {
 const resetFilters = { minPrice: '', maxPrice: '', bedrooms: '', type: '', status: '', amenities: [], radius: '', page: 1 };
 setFilters(resetFilters);
 dispatch(fetchProperties(resetFilters));
 };

 const itemsPerPage = 12; // Assuming API returns 12 per page
 const totalPages = Math.ceil(total / itemsPerPage) || 1;

 return (
 <PageTransition className="bg-surface-dim min-h-screen transition-colors duration-200 pb-20">
 <Helmet>
 <title>PropSense | Explore Premium Properties</title>
 <meta name="description" content="Filter and search through our curated list of premium and luxury real estate properties." />
 </Helmet>
 {/* Header Banner */}
 <div className="bg-gray-900 text-white py-16 px-4 relative overflow-hidden">
 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
 <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
 <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">Explore Properties</h1>
 <p className="mt-3 text-lg text-gray-300 font-medium">Find the perfect place to call home with our advanced filters.</p>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
 {/* Mobile Filter Toggle */}
 <button 
 className="md:hidden flex items-center justify-center gap-2 bg-surface border border-outline-variant/50 py-4 rounded-xl font-bold shadow-sm"
 onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
 >
 <Filter size={20} /> {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
 </button>

 {/* LEFT SIDEBAR: FILTERS */}
 <motion.aside 
 initial={{ x: -300, opacity: 0 }} 
 animate={{ x: 0, opacity: 1 }}
 transition={{ duration: 0.4, ease:"easeOut" }}
 className={`w-full md:w-80 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden'} md:block`}
 >
 <div className="bg-surface rounded-3xl shadow-lg border border-outline-variant/30 p-6 sticky top-24">
 <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
 <h2 className="text-xl font-extrabold flex items-center gap-2 text-on-surface">
 <SlidersHorizontal size={20} /> Filters
 </h2>
 <button onClick={clearFilters} className="text-sm text-primary hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors">
 Clear All
 </button>
 </div>

 <form onSubmit={applyFilters} className="space-y-8">
 {/* Price Range */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Price Range (₹)</h3>
 <div className="flex gap-3 items-center">
 <input 
 type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleFilterChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-on-surface transition-all shadow-inner"
 />
 <span className="text-gray-400 font-bold">-</span>
 <input 
 type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleFilterChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-on-surface transition-all shadow-inner"
 />
 </div>
 </div>

 {/* Property Type */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Property Type</h3>
 <select 
 name="type" value={filters.type} onChange={handleFilterChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-on-surface capitalize transition-all cursor-pointer shadow-sm appearance-none"
 >
 <option value="">Any Type</option>
 {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
 </select>
 </div>

 {/* Status */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Status</h3>
 <select 
 name="status" value={filters.status} onChange={handleFilterChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-on-surface transition-all cursor-pointer shadow-sm appearance-none"
 >
 <option value="">Any Status</option>
 <option value="available">Available</option>
 <option value="under_offer">Under Offer</option>
 <option value="sold">Sold</option>
 </select>
 </div>

 {/* Bedrooms */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Bedrooms</h3>
 <div className="flex gap-2">
 {['1', '2', '3', '4', '5+'].map(num => (
 <button
 key={num} type="button"
 onClick={() => setFilters(prev => ({ ...prev, bedrooms: prev.bedrooms === num ? '' : num }))}
 className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${filters.bedrooms === num ? 'bg-primary text-on-primary text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-surface-dim text-on-surface-variant border-outline-variant/50 hover:border-blue-400 hover:text-primary dark:hover:text-blue-400'}`}
 >
 {num}
 </button>
))}
 </div>
 </div>

 {/* Radius Search */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Radius Search (km)</h3>
 <input 
 type="number" name="radius" placeholder="e.g. 5" value={filters.radius} onChange={handleFilterChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-on-surface transition-all shadow-inner"
 />
 </div>

 {/* Amenities */}
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Amenities</h3>
 <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
 {AVAILABLE_AMENITIES.map(amenity => (
 <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
 <input 
 type="checkbox" name="amenities" value={amenity} 
 checked={filters.amenities.includes(amenity)} onChange={handleFilterChange}
 className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-blue-500 dark:bg-surface-variant transition-colors cursor-pointer"
 />
 <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{amenity}</span>
 </label>
))}
 </div>
 </div>

 {/* Submit Button */}
 <button type="submit" className="w-full py-4 mt-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/30 transition-transform hover:-translate-y-1 active:translate-y-0">
 Apply Filters
 </button>
 </form>
 </div>
 </motion.aside>

 {/* RIGHT SIDE: PROPERTY GRID */}
 <main className="flex-1">
 {/* Top Bar showing count */}
 <div className="mb-8 flex items-center justify-between bg-surface p-4 rounded-2xl shadow-sm border border-outline-variant/30">
 <p className="text-on-surface-variant font-medium text-lg">
 Showing <span className="text-primary font-black text-xl">{total || 0}</span> properties
 </p>
 </div>

 {/* Grid */}
 <motion.div 
 variants={staggerGrid}
 initial="hidden"
 animate="visible"
 className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
 >
 {loading ? (
 // Skeleton State
 Array(6).fill(0).map((_, i) => (
 <div key={i} className="rounded-2xl overflow-hidden shadow-md bg-surface border border-outline-variant/30">
 <Skeleton height={224} className="dark:bg-surface-variant rounded-none" />
 <div className="p-6">
 <Skeleton count={1} height={24} className="mb-3 dark:bg-surface-variant" />
 <Skeleton count={1} width="60%" className="mb-4 dark:bg-surface-variant" />
 <div className="flex gap-2 mt-4">
 <Skeleton width={80} height={32} className="dark:bg-surface-variant rounded-md" />
 <Skeleton width={80} height={32} className="dark:bg-surface-variant rounded-md" />
 </div>
 <div className="mt-8 flex justify-between items-end">
 <Skeleton width={100} height={28} className="dark:bg-surface-variant" />
 <Skeleton width={90} height={40} className="dark:bg-surface-variant rounded-xl" />
 </div>
 </div>
 </div>
))
) : properties?.length > 0 ? (
 properties.map(property => (
 <MockPropertyCard key={property._id} property={property} />
))
) : (
 // Empty State Illustration
 <div className="col-span-full py-28 flex flex-col items-center justify-center text-center bg-surface rounded-3xl border-2 border-dashed border-outline-variant/50 shadow-sm">
 <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
 <SearchX size={48} />
 </div>
 <h3 className="text-3xl font-extrabold text-on-surface mb-4 tracking-tight">No properties found</h3>
 <p className="text-lg text-on-surface-variant max-w-md">
 We couldn't find any properties matching your exact criteria. Try adjusting the filters to see more results.
 </p>
 <button onClick={clearFilters} className="mt-8 px-8 py-4 bg-primary text-on-primary font-bold text-lg rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-xl">
 Clear All Filters
 </button>
 </div>
)}
 </motion.div>

 {/* Pagination */}
 {totalPages > 1 && !loading && properties?.length > 0 && (
 <div className="mt-16 flex items-center justify-center gap-3">
 <button 
 onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
 disabled={filters.page === 1}
 className="p-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface-variant disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-surface-variant transition-colors shadow-sm"
 >
 <ChevronLeft size={24} />
 </button>
 
 {[...Array(totalPages)].map((_, i) => (
 <button
 key={i}
 onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
 className={`w-12 h-12 rounded-xl font-extrabold text-lg transition-all ${
 filters.page === i + 1 
 ? 'bg-primary text-on-primary text-white shadow-lg shadow-blue-500/30 -translate-y-1' 
 : 'border border-outline-variant/50 bg-surface text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant shadow-sm'
 }`}
 >
 {i + 1}
 </button>
))}

 <button 
 onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
 disabled={filters.page === totalPages}
 className="p-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface-variant disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-surface-variant transition-colors shadow-sm"
 >
 <ChevronRight size={24} />
 </button>
 </div>
)}
 </main>
 </div>
 </PageTransition>
);
}
