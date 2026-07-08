import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import { useDispatch, useSelector } from 'react-redux';
import { 
 fetchPropertyById, toggleFavorite, contactAgent, clearSelectedProperty, fetchFavorites
} from '../../features/property/propertySlice';
import { createDeal } from '../../features/deal/dealSlice';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 MapPin, Bed, Bath, Square, Calendar, Heart, MessageCircle, 
 Sparkles, User, FileText, ArrowLeft, Eye, X, Send
} from 'lucide-react';

export default function PropertyDetail() {
 const { id } = useParams();
 const navigate = useNavigate();
 const dispatch = useDispatch();
 
 const { selected: property, loading, favoriteIds } = useSelector((state) => state.property);
 const { user } = useSelector((state) => state.auth);

 const isFavorited = favoriteIds.includes(id);

 // Local states for AI features and Modals
 const [similarProperties, setSimilarProperties] = useState([]);
 const [aiDescription, setAiDescription] = useState(null);
 const [aiValuation, setAiValuation] = useState(null);
 const [isAiLoading, setIsAiLoading] = useState(false);
 const [isContactModalOpen, setIsContactModalOpen] = useState(false);
 const [isDealModalOpen, setIsDealModalOpen] = useState(false);
 
 // Form states
 const [contactMessage, setContactMessage] = useState('');
 const [offerAmount, setOfferAmount] = useState('');
 const [activeImageIndex, setActiveImageIndex] = useState(0);

 const galleryRef = useRef(null);

 useEffect(() => {
 dispatch(fetchPropertyById(id));
 fetchSimilarProperties(id);
 if (user) dispatch(fetchFavorites()); // Sync favoriteIds for heart icon state
 
 return () => {
 dispatch(clearSelectedProperty());
 };
 }, [dispatch, id, user]);

 const fetchSimilarProperties = async (propertyId) => {
 try {
 const response = await api.get(`/properties/similar/${propertyId}`);
 setSimilarProperties(response.data.properties || response.data || []);
 } catch (error) {
 console.error("Failed to fetch similar properties", error);
 }
 };

 const handleGenerateAiDescription = async () => {
 if (!user) return toast.error("Please log in to use AI Rewrite.");
 setIsAiLoading(true);
 try {
 const response = await api.post(`/ai/describe`, { propertyId: id });
 setAiDescription(response.data.full || response.data.medium || response.data);
 toast.success("AI generated a brilliant description!");
 } catch (error) {
 toast.error("Failed to generate AI description.");
 } finally {
 setIsAiLoading(false);
 }
 };

 const handleAiValuation = async () => {
 if (!user) return toast.error("Please log in to use AI Valuation.");
 setIsAiLoading(true);
 try {
 const response = await api.post(`/ai/valuate`, { propertyId: id });
 setAiValuation(response.data);
 toast.success("AI Valuation complete!");
 } catch (error) {
 toast.error("Failed to run AI Valuation.");
 } finally {
 setIsAiLoading(false);
 }
 };

 const handleToggleFavorite = async () => {
 if (!user) return toast.error("Please log in to save properties.");
 const result = await dispatch(toggleFavorite(id));
 if (toggleFavorite.fulfilled.match(result)) {
 const { favorited } = result.payload;
 toast.success(favorited ?"Added to favorites!" :"Removed from favorites.");
 } else {
 toast.error("Failed to update favorites.");
 }
 };

 const handleContactAgent = async (e) => {
 e.preventDefault();
 if (!user) return toast.error("Please log in to contact the agent.");
 
 const result = await dispatch(contactAgent({ id, messageData: { message: contactMessage } }));
 if (contactAgent.fulfilled.match(result)) {
 toast.success("Message sent to agent!");
 setIsContactModalOpen(false);
 setContactMessage('');
 } else {
 toast.error("Failed to send message.");
 }
 };

 const handleCreateDeal = async (e) => {
 e.preventDefault();
 if (!offerAmount || Number(offerAmount) <= 0) {
 return toast.error("Please enter a valid offer amount.");
 }
 const result = await dispatch(createDeal({ 
 propertyId: id, 
 offeredPrice: Number(offerAmount) 
 }));
 if (createDeal.fulfilled.match(result)) {
 toast.success("Offer submitted! A deal has been initiated.");
 setIsDealModalOpen(false);
 navigate('/deals');
 } else {
 toast.error(result.payload ||"Failed to submit offer.");
 }
 };

 const scrollGallery = (direction) => {
 if (galleryRef.current) {
 const scrollAmount = galleryRef.current.offsetWidth;
 galleryRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
 }
 };

 if (loading || !property) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <Skeleton height={400} className="rounded-3xl mb-8 dark:bg-surface-variant" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-4">
 <Skeleton height={40} width="70%" className="dark:bg-surface-variant" />
 <Skeleton height={20} width="40%" className="dark:bg-surface-variant" />
 <Skeleton height={100} className="mt-8 dark:bg-surface-variant" />
 </div>
 <div><Skeleton height={300} className="rounded-2xl dark:bg-surface-variant" /></div>
 </div>
 </div>
);
 }

 return (
 <PageTransition className="bg-surface-dim min-h-screen pb-24 transition-colors duration-200">
 <Helmet>
 <title>{property.title} | PropSense</title>
 <meta name="description" content={property.description || `View details for ${property.title} located at ${property.location?.address}.`} />
 <meta property="og:title" content={`${property.title} | PropSense`} />
 <meta property="og:description" content={property.description || `View details for ${property.title}.`} />
 </Helmet>
 {/* Top Nav Back */}
 <div className="max-w-7xl mx-auto px-4 py-6">
 <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
 <ArrowLeft size={20} /> Back to Listings
 </button>
 </div>

 <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
 {/* LEFT SIDE: DETAILS */}
 <div className="lg:col-span-2 space-y-10">
 
 {/* Image Gallery (Swipeable) */}
 <div className="relative group rounded-3xl overflow-hidden shadow-xl bg-surface-variant h-[300px] md:h-[500px]">
 {property.images && property.images.length > 0 ? (
 <>
 <div 
 ref={galleryRef}
 className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
 onScroll={(e) => {
 const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
 setActiveImageIndex(index);
 }}
 >
 {property.images.map((img, i) => (
 <img loading="lazy" decoding="async" key={i} src={img?.url || (typeof img === 'string' ? img : '')} alt={`${property.title} - ${i+1}`} className="w-full h-full object-cover shrink-0 snap-center" />
))}
 </div>
 
 {/* Gallery Controls */}
 {property.images.length > 1 && (
 <>
 <button onClick={() => scrollGallery('left')} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 /80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
 <ArrowLeft size={24} />
 </button>
 <button onClick={() => scrollGallery('right')} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 /80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rotate-180">
 <ArrowLeft size={24} />
 </button>
 <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">
 {property.images.map((_, i) => (
 <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
))}
 </div>
 </>
)}
 </>
) : (
 <div className="w-full h-full flex items-center justify-center text-gray-400">No images available</div>
)}
 
 {/* Status Badge */}
 <div className="absolute top-4 left-4 bg-white/95 /95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-on-surface uppercase tracking-wider shadow-lg">
 {property.status?.replace('_', ' ') || 'Available'}
 </div>
 </div>

 {/* Header Info */}
 <div>
 <div className="flex justify-between items-start gap-4">
 <div>
 <h1 className="text-3xl md:text-5xl font-black text-on-surface leading-tight">{property.title}</h1>
 <p className="text-lg text-on-surface-variant mt-2 flex items-center gap-2 font-medium">
 <MapPin size={18} /> {property.location?.address}, {property.location?.city}
 </p>
 </div>
 <button onClick={handleToggleFavorite} className={`p-3 rounded-full transition-colors flex-shrink-0 mt-2 ${isFavorited ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40'}`}>
 <Heart size={28} className={isFavorited ?"fill-current" :""} />
 </button>
 </div>
 
 <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold">
 <span className="text-primary text-3xl font-black">
 ₹{property.price?.toLocaleString('en-IN') || 'Price on Request'}
 </span>
 <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-lg uppercase">
 {property.type}
 </span>
 <span className="flex items-center gap-1 text-gray-400">
 <Eye size={16} /> {property.views || 0} views
 </span>
 </div>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm">
 <div className="flex flex-col items-center justify-center text-center">
 <Bed size={24} className="text-blue-500 mb-2" />
 <span className="text-2xl font-bold text-on-surface">{property.bedrooms || '-'}</span>
 <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Bedrooms</span>
 </div>
 <div className="flex flex-col items-center justify-center text-center border-l border-outline-variant/30">
 <Bath size={24} className="text-blue-500 mb-2" />
 <span className="text-2xl font-bold text-on-surface">{property.bathrooms || '-'}</span>
 <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Bathrooms</span>
 </div>
 <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0">
 <Square size={24} className="text-blue-500 mb-2" />
 <span className="text-2xl font-bold text-on-surface">{property.sqft ? `${property.sqft}` : '-'}</span>
 <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Sq. Ft.</span>
 </div>
 <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0">
 <Calendar size={24} className="text-blue-500 mb-2" />
 <span className="text-2xl font-bold text-on-surface">{property.yearBuilt || '-'}</span>
 <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Year Built</span>
 </div>
 </div>

 {/* Description & AI Features */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-2xl font-bold text-on-surface">Description</h2>
 <button 
 onClick={handleGenerateAiDescription} 
 disabled={isAiLoading} 
 className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
 user 
 ?"bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40" 
 :"bg-surface-variant text-gray-400 cursor-not-allowed"
 }`}
 title={!user ?"Login required" :"AI Rewrite"}
 >
 <Sparkles size={16} /> {user ?"AI Rewrite" :"Login to use AI"}
 </button>
 </div>
 <div className="prose dark:prose-invert max-w-none text-on-surface-variant leading-relaxed">
 {aiDescription ? (
 <p className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
 {aiDescription}
 </p>
) : (
 <p>{property.description || 'No description provided.'}</p>
)}
 </div>
 </div>

 {/* Amenities */}
 {property.amenities && property.amenities.length > 0 && (
 <div>
 <h2 className="text-2xl font-bold text-on-surface mb-6">Amenities</h2>
 <div className="flex flex-wrap gap-3">
 {property.amenities.map((am, i) => (
 <span key={i} className="px-4 py-2 bg-surface-variant text-on-surface font-medium rounded-xl border border-outline-variant/50">
 {am}
 </span>
))}
 </div>
 </div>
)}
 </div>

 {/* RIGHT SIDE: SIDEBAR */}
 <div className="space-y-6">
 
 {/* Agent Card */}
 <div className="bg-surface rounded-3xl p-6 shadow-xl border border-outline-variant/30 sticky top-24">
 <h3 className="text-xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Listed By</h3>
 
 <div className="flex items-center gap-4 mb-8">
 <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center overflow-hidden shrink-0">
 {property.agent?.avatar ? (
 <img loading="lazy" decoding="async" src={property.agent.avatar} alt={property.agent.name} className="w-full h-full object-cover" />
) : (
 <User size={32} className="text-gray-400" />
)}
 </div>
 <div>
 <h4 className="text-lg font-bold text-on-surface">{property.agent?.name || 'Verified Agent'}</h4>
 <p className="text-sm text-on-surface-variant">PropSense Certified</p>
 </div>
 </div>

 <div className="space-y-3">
 <button onClick={() => setIsContactModalOpen(true)} className="w-full py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-bold rounded-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 shadow-md">
 <MessageCircle size={20} /> Contact Agent
 </button>
 
 {user?.role === 'buyer' && property.status !== 'sold' && (
 <button onClick={() => setIsDealModalOpen(true)} className="w-full py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-white font-bold rounded-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 shadow-md shadow-blue-500/20">
 <FileText size={20} /> Make an Offer
 </button>
)}
 </div>

 <div className="mt-8 pt-8 border-t border-outline-variant/30">
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-2">
 <Sparkles size={16} className="text-purple-500" /> PropSense AI
 </h3>
 {aiValuation ? (
 <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
 <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">Estimated Value</p>
 <p className="text-2xl font-black text-on-surface">
 ₹{Number(aiValuation.mid || aiValuation).toLocaleString('en-IN')}
 </p>
 <p className="text-[10px] mt-2 text-on-surface-variant font-medium italic leading-tight">
 {aiValuation.rationale}
 </p>
 </div>
) : (
 <button 
 onClick={handleAiValuation} 
 disabled={isAiLoading} 
 className={`w-full py-3 border font-bold rounded-xl transition-colors text-sm ${
 user
 ?"bg-surface-variant hover:bg-surface-variant border-outline-variant/50 text-on-surface-variant"
 :"bg-surface-variant border-outline-variant/50 text-gray-400 cursor-not-allowed"
 }`}
 >
 {user ?"Run AI Valuation Check" :"Login for AI Valuation"}
 </button>
)}
 </div>
 </div>
 </div>
 </div>

 {/* SIMILAR PROPERTIES */}
 {similarProperties.length > 0 && (
 <div className="max-w-7xl mx-auto px-4 mt-20">
 <h2 className="text-3xl font-extrabold text-on-surface mb-8">Similar Properties</h2>
 <motion.div 
 initial="hidden"
 animate="visible"
 variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
 >
 {similarProperties.map(prop => (
 <motion.div key={prop._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
 <Link to={`/properties/${prop._id}`} className="group rounded-2xl bg-white shadow-sm overflow-hidden border border-outline-variant/30 transition-shadow hover:shadow-xl block">
 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full flex flex-col">
 <div className="h-40 bg-surface-variant shrink-0">
 {prop.images?.[0]?.url && <img loading="lazy" decoding="async" src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
 </div>
 <div className="p-4 flex-1">
 <h3 className="font-bold text-on-surface truncate">{prop.title}</h3>
 <p className="text-primary font-extrabold mt-2">₹{prop.price?.toLocaleString('en-IN')}</p>
 </div>
 </motion.div>
 </Link>
 </motion.div>
))}
 </motion.div>
 </div>
)}

 {/* MODALS */}
 {/* Contact Modal */}
 {isContactModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-outline-variant/30">
 <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
 <X size={24} />
 </button>
 <h2 className="text-2xl font-bold text-on-surface mb-2">Contact Agent</h2>
 <p className="text-sm text-on-surface-variant mb-6">Send a message to {property.agent?.name || 'the agent'} regarding {property.title}.</p>
 
 <form onSubmit={handleContactAgent}>
 <textarea
 value={contactMessage}
 onChange={(e) => setContactMessage(e.target.value)}
 placeholder="Hi, I'm interested in this property. When can we schedule a viewing?"
 className="w-full h-32 px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface resize-none mb-4"
 required
 ></textarea>
 <button type="submit" className="w-full py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5">
 <Send size={18} /> Send Message
 </button>
 </form>
 </div>
 </div>
)}

 {/* Deal/Offer Modal */}
 {isDealModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-outline-variant/30">
 <button onClick={() => setIsDealModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
 <X size={24} />
 </button>
 <h2 className="text-2xl font-bold text-on-surface mb-2">Make an Offer</h2>
 <p className="text-sm text-on-surface-variant mb-6">Initiate a deal for {property.title}.</p>
 
 <form onSubmit={handleCreateDeal}>
 <div className="mb-6">
 <label className="block text-sm font-bold text-on-surface mb-2">Your Offer Amount (₹)</label>
 <input
 type="number"
 value={offerAmount}
 onChange={(e) => setOfferAmount(e.target.value)}
 placeholder={property.price}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface"
 required
 />
 </div>
 <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5">
 <FileText size={18} /> Submit Official Offer
 </button>
 </form>
 </div>
 </div>
)}
 </PageTransition>
);
}
