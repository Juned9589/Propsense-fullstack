import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeatured } from '../features/property/propertySlice';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { 
 Search, Sparkles, Star, ChevronDown, 
 ArrowRight, Shield, Facebook, Twitter, Instagram, Heart 
} from 'lucide-react';
import { toggleFavorite, fetchFavorites } from '../features/property/propertySlice';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Simple Mock for PropertyCard until it's built separately
const MockPropertyCard = ({ property }) => {
 const dispatch = useDispatch();
 const { user } = useSelector((state) => state.auth);
 const { favoriteIds } = useSelector((state) => state.property);
 const isFavorited = (favoriteIds || []).includes(property._id);

 const handleToggleFavorite = (e) => {
 e.preventDefault();
 if (!user) return toast.error("Please log in to save properties.");
 dispatch(toggleFavorite(property._id));
 };

 return (
 <motion.div 
 whileHover={{ y: -8, scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="rounded-2xl bg-surface/80 backdrop-blur-md shadow-lg overflow-hidden border border-outline-variant transition-all hover:shadow-2xl duration-500 relative interactive group"
 >
 <div className="h-56 bg-surface-dim relative overflow-hidden">
 {property.images?.[0]?.url ? (
 <img loading="lazy" decoding="async" src={property.images[0].url} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
) : (
 <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No Image</div>
)}
 <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
 Featured
 </div>
 <button 
 onClick={handleToggleFavorite}
 className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm interactive ${
 isFavorited ?"bg-error text-on-error" :"bg-surface/80 text-on-surface-variant hover:text-error"
 }`}
 >
 <Heart size={18} className={isFavorited ?"fill-current" :""} />
 </button>
 </div>
 <div className="p-6">
 <h3 className="text-xl font-serif font-bold text-on-surface truncate group-hover:text-primary transition-colors">{property.title}</h3>
 <p className="text-sm text-on-surface-variant mt-2 font-medium">{property.address?.city || property.location?.city || 'Location N/A'}</p>
 <div className="mt-5 flex justify-between items-center pt-4 border-t border-outline-variant/50">
 <span className="text-on-surface font-extrabold text-xl">
 ₹{property.price?.toLocaleString('en-IN') || 'Price on request'}
 </span>
 <Link to={`/properties/${property._id}`} className="text-sm font-bold text-primary hover:text-primary-container transition-colors interactive">
 View Details
 </Link>
 </div>
 </div>
 </motion.div>
);
};
;

// Framer Motion Animation Variants
const fadeUp = {
 hidden: { opacity: 0, y: 40 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease:"easeOut" } }
};

const staggerContainer = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.2 }
 }
};

export default function Landing() {
 const dispatch = useDispatch();
 const { featured, loading: propertyLoading } = useSelector(state => state.property);
 
 const [aiInput, setAiInput] = useState('');
 const [aiLoading, setAiLoading] = useState(false);
 const [aiMatches, setAiMatches] = useState([]);
 const [openFaq, setOpenFaq] = useState(null);

 const { user } = useSelector(state => state.auth);
 
 // Fetch Featured Properties and Favorites on Mount/Auth Change
 useEffect(() => {
 dispatch(fetchFeatured());
 if (user) dispatch(fetchFavorites());
 }, [dispatch, user]);

 // Handle AI Match Request
 const handleAiMatch = async (e) => {
 e.preventDefault();
 if (!aiInput.trim()) return;
 setAiLoading(true);
 try {
 const response = await api.post('/ai/match', { preferenceText: aiInput });
 setAiMatches(response.data.matches || []);
 toast.success("Found the best matches for you!");
 } catch (error) {
 toast.error("Failed to fetch AI matches. Please try again.");
 } finally {
 setAiLoading(false);
 }
 };

 return (
 <PageTransition className="min-h-screen bg-surface text-on-surface transition-colors duration-200">
 <Helmet>
 <title>PropSense | Luxury Real Estate & AI Concierge</title>
 <meta name="description" content="Discover premium, off-market, and luxury real estate properties with PropSense. Experience bespoke matching with our AI concierge." />
 <meta property="og:title" content="PropSense | Premium Real Estate" />
 <meta property="og:description" content="Discover premium, off-market, and luxury real estate properties with PropSense." />
 <meta property="og:type" content="website" />
 <meta name="twitter:card" content="summary_large_image" />
 </Helmet>
 {/* 1. HERO SECTION */}
 <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
 <div className="absolute inset-0 z-0">
 <img loading="lazy" decoding="async" 
 src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" 
 alt="Luxury Home" 
 className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
 />
 <div className="absolute inset-0 bg-black/60 dark:bg-black/80" />
 <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
 </div>
 
 <motion.div 
 initial="hidden" animate="visible" variants={fadeUp}
 className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20"
 >
 <motion.div
 animate={{ y: [0, -10, 0] }}
 transition={{ duration: 4, repeat: Infinity, ease:"easeInOut" }}
 className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-surface/30 backdrop-blur-md border border-white/20 text-sm font-bold text-white mb-8 shadow-xl"
 >
 <Sparkles size={16} className="mr-2 text-primary" /> Luxe Ambient Experience
 </motion.div>
 
 <h1 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
 Elevated Living, <br/><span className="text-primary drop-shadow-xl font-style-italic">Redefined.</span>
 </h1>
 <p className="mt-8 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-lg font-medium leading-relaxed">
 Experience the smartest way to discover premium real estate with AI-powered matching and exclusive verified agents.
 </p>
 <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
 <Link to="/properties" className="px-10 py-5 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-full font-bold shadow-[0_8px_30px_rgb(119,90,25,0.3)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1 interactive">
 <Search size={20} /> Explore Collection
 </Link>
 <a href="#ai-match" className="px-10 py-5 bg-surface/10 hover:bg-surface/20 backdrop-blur-md border border-white/20 text-white rounded-full font-bold shadow-xl transition-all flex items-center justify-center gap-3 hover:-translate-y-1 interactive">
 <Sparkles size={20} /> AI Concierge
 </a>
 </div>
 </motion.div>
 </section>

 {/* 2. FEATURED PROPERTIES */}
 <section className="py-32 px-4 max-w-[1440px] mx-auto">
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin:"-100px" }} variants={fadeUp} className="text-center mb-20">
 <h2 className="text-5xl font-serif font-bold tracking-tight text-on-surface">Curated Residences</h2>
 <p className="mt-6 text-xl text-on-surface-variant max-w-2xl mx-auto">Discover our portfolio of extraordinary properties, selected for their uncompromising quality and architectural significance.</p>
 </motion.div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
 {propertyLoading ? (
 Array(3).fill(0).map((_, i) => (
 <div key={i} className="rounded-2xl overflow-hidden shadow-lg bg-surface border border-outline-variant/30">
 <Skeleton height={224} className="rounded-none bg-surface-variant" />
 <div className="p-6">
 <Skeleton count={2} className="mb-3 bg-surface-variant" />
 <Skeleton width={120} className="mt-5 bg-surface-variant" />
 </div>
 </div>
))
) : featured.length > 0 ? (
 featured.slice(0, 3).map((prop) => (
 <MockPropertyCard key={prop._id} property={prop} />
))
) : (
 <p className="col-span-full text-center text-on-surface-variant py-16 text-lg">No curated properties available at the moment.</p>
)}
 </div>
 
 <div className="mt-20 text-center">
 <Link to="/properties" className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:gap-4 transition-all uppercase tracking-widest interactive">
 View Complete Portfolio <ArrowRight size={20} />
 </Link>
 </div>
 </section>

 {/* 3. AI MATCH BANNER */}
 <section id="ai-match" className="py-32 bg-surface-dim relative overflow-hidden border-y border-outline-variant/50">
 <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #7f7667 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
 <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
 <div className="inline-flex items-center justify-center w-24 h-24 bg-surface rounded-full mb-10 shadow-xl border border-outline-variant">
 <Sparkles className="h-10 w-10 text-primary animate-pulse" />
 </div>
 <h2 className="text-5xl md:text-6xl font-serif font-bold text-on-surface mb-6 tracking-tight">The AI Concierge</h2>
 <p className="text-on-surface-variant mb-14 text-xl font-medium max-w-2xl mx-auto">Describe your lifestyle preferences, and our algorithm will instantly curate a selection of perfectly matched properties.</p>
 
 <form onSubmit={handleAiMatch} className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
 <input 
 type="text" 
 value={aiInput}
 onChange={(e) => setAiInput(e.target.value)}
 placeholder="e.g. A minimalist penthouse in Mumbai with sea views and a home office..." 
 className="flex-1 px-8 py-5 rounded-full bg-surface text-on-surface border border-outline-variant focus:outline-none focus:border-primary shadow-lg text-lg interactive"
 />
 <button 
 type="submit" 
 disabled={aiLoading}
 className="px-10 py-5 bg-on-surface hover:bg-primary text-surface rounded-full font-bold shadow-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-3 whitespace-nowrap text-lg interactive"
 >
 {aiLoading ? (
 <>
 <svg className="animate-spin h-6 w-6 text-surface" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 Analyzing...
 </>
) : 'Curate Matches'}
 </button>
 </form>
 </motion.div>

 {/* AI Results Area */}
 <AnimatePresence>
 {aiMatches.length > 0 && (
 <motion.div 
 initial={{ opacity: 0, y: 40 }} 
 animate={{ opacity: 1, y: 0 }} 
 exit={{ opacity: 0, y: -40 }}
 className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
 >
 {aiMatches.slice(0, 4).map((prop, i) => (
 <div key={i} className="bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-outline-variant shadow-lg flex gap-6 hover:shadow-xl transition-all hover:-translate-y-1 interactive">
 <div className="w-28 h-28 bg-surface-variant rounded-xl shrink-0 overflow-hidden">
 {prop.images?.[0]?.url ? (
 <img loading="lazy" decoding="async" src={prop.images[0].url} alt="Prop" className="w-full h-full object-cover" />
) : (
 <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No Img</div>
)}
 </div>
 <div className="flex flex-col justify-center">
 <h4 className="font-serif font-bold text-on-surface truncate text-xl">{prop.title}</h4>
 <p className="text-sm text-on-surface-variant mt-2 font-medium">{prop.address?.city || prop.location?.city}</p>
 <Link to={`/properties/${prop._id}`} className="inline-block mt-4 text-sm font-bold text-primary uppercase tracking-widest hover:text-on-surface interactive">View Details</Link>
 </div>
 </div>
))}
 </motion.div>
)}
 </AnimatePresence>
 </div>
 </section>

 {/* 4. ABOUT & STATS */}
 <section className="py-24 px-4 bg-surface">
 <div className="max-w-[1440px] mx-auto">
 <motion.div 
 variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
 className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
 >
 <motion.div variants={fadeUp} className="p-8">
 <div className="text-7xl font-serif font-extrabold text-primary mb-4 drop-shadow-sm">500+</div>
 <div className="text-2xl font-serif font-bold text-on-surface">Curated Listings</div>
 <p className="text-on-surface-variant mt-3 text-lg">Exclusive properties across prime locations.</p>
 </motion.div>
 <motion.div variants={fadeUp} className="p-8 md:border-l border-outline-variant/30 relative">
 <div className="text-7xl font-serif font-extrabold text-primary mb-4 drop-shadow-sm">300+</div>
 <div className="text-2xl font-serif font-bold text-on-surface">Private Clients</div>
 <p className="text-on-surface-variant mt-3 text-lg">Discreet and exceptional service.</p>
 </motion.div>
 <motion.div variants={fadeUp} className="p-8 md:border-l border-outline-variant/30">
 <div className="text-7xl font-serif font-extrabold text-primary mb-4 drop-shadow-sm">10+</div>
 <div className="text-2xl font-serif font-bold text-on-surface">Years Heritage</div>
 <p className="text-on-surface-variant mt-3 text-lg">A legacy of architectural excellence.</p>
 </motion.div>
 </motion.div>
 </div>
 </section>

 {/* 5. HOW IT WORKS */}
 <section className="py-32 bg-surface-dim px-4 border-y border-outline-variant/30">
 <div className="max-w-[1440px] mx-auto">
 <div className="text-center mb-24">
 <h2 className="text-5xl font-serif font-bold tracking-tight text-on-surface">The Process</h2>
 <p className="mt-6 text-xl text-on-surface-variant max-w-2xl mx-auto">A seamless transition to your next distinguished residence.</p>
 </div>
 <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
 {/* Connecting Line (Desktop) */}
 <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-[1px] bg-outline-variant z-0"></div>

 {[
 { icon: Search, title:"Curated Selection", desc:"Explore our exclusive portfolio of off-market and premium listings." },
 { icon: Sparkles, title:"Bespoke Matching", desc:"Utilize our AI concierge to discover properties that resonate with your taste." },
 { icon: Shield, title:"Private Acquisition", desc:"Experience a discreet, white-glove closing process with verified experts." }
 ].map((item, i) => (
 <motion.div key={i} variants={fadeUp} className="text-center relative z-10 group">
 <div className="w-36 h-36 mx-auto bg-surface border border-outline-variant shadow-xl rounded-full flex items-center justify-center text-primary mb-8 transition-transform duration-500 group-hover:scale-110">
 <item.icon size={48} strokeWidth={1.5} />
 </div>
 <h3 className="text-2xl font-serif font-bold mb-4 text-on-surface">{item.title}</h3>
 <p className="text-on-surface-variant text-lg leading-relaxed">{item.desc}</p>
 </motion.div>
))}
 </motion.div>
 </div>
 </section>

 {/* 6. TESTIMONIALS */}
 <section className="py-28 bg-surface px-4">
 <div className="max-w-7xl mx-auto">
 <h2 className="text-4xl font-extrabold text-center mb-16 tracking-tight">What Our Clients Say</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {[
 { name:"Rahul Sharma", role:"Homeowner", text:"PropSense made finding our home incredibly easy. The AI match feature showed us exactly what we were looking for!" },
 { name:"Priya Patel", role:"Property Investor", text:"The verified agents and seamless deal tracking gave me the confidence I needed to expand my portfolio." },
 { name:"Amit Kumar", role:"First-time Buyer", text:"I was overwhelmed by options until I used PropSense. The filtering and AI tools saved me months of searching." }
 ].map((item, i) => (
 <div key={i} className="p-8 rounded-3xl bg-surface-dim border border-outline-variant/50 shadow-sm">
 <div className="flex text-yellow-400 mb-6">
 {[...Array(5)].map((_, j) => <Star key={j} size={20} fill="currentColor" />)}
 </div>
 <p className="text-on-surface-variant mb-8 italic text-lg leading-relaxed">
"{item.text}"
 </p>
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-surface-variant rounded-full flex items-center justify-center text-xl font-bold text-on-surface-variant">
 {item.name.charAt(0)}
 </div>
 <div>
 <h4 className="font-bold text-lg">{item.name}</h4>
 <p className="text-sm text-on-surface-variant font-medium">{item.role}</p>
 </div>
 </div>
 </div>
))}
 </div>
 </div>
 </section>

 {/* 7. FAQ ACCORDION */}
 <section className="py-28 bg-surface-dim px-4">
 <div className="max-w-3xl mx-auto">
 <h2 className="text-4xl font-extrabold text-center mb-12 tracking-tight">Frequently Asked Questions</h2>
 <div className="space-y-4">
 {[
 { q:"How does the AI Match work?", a:"Our AI analyzes your natural language input to find properties with amenities, locations, and prices that align perfectly with your description." },
 { q:"Are the agents verified?", a:"Yes, every agent on PropSense undergoes a strict verification process to ensure security and professionalism before they can list properties." },
 { q:"Is it free to browse properties?", a:"Absolutely! Browsing, filtering, and getting AI matches is 100% free for all buyers." },
 { q:"How do I schedule a viewing?", a:"Once you find a property you like, click 'View Details' and use the contact form to directly message the verified agent to set up a time." }
 ].map((faq, i) => (
 <div key={i} className="border border-outline-variant/50 rounded-xl bg-surface shadow-sm overflow-hidden transition-all">
 <button 
 onClick={() => setOpenFaq(openFaq === i ? null : i)}
 className="w-full flex justify-between items-center p-6 text-left font-bold text-lg focus:outline-none hover:bg-surface-variant transition-colors"
 >
 {faq.q}
 <ChevronDown className={`transition-transform duration-300 text-primary ${openFaq === i ? 'rotate-180' : ''}`} size={24} />
 </button>
 <AnimatePresence>
 {openFaq === i && (
 <motion.div 
 initial={{ height: 0, opacity: 0 }} 
 animate={{ height: 'auto', opacity: 1 }} 
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="p-6 pt-0 text-on-surface-variant font-medium">
 {faq.a}
 </div>
 </motion.div>
)}
 </AnimatePresence>
 </div>
))}
 </div>
 </div>
 </section>

 {/* 6. CTA SECTION */}
 <section className="py-32 bg-primary relative overflow-hidden text-center px-4">
 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #fff 0%, transparent 70%)' }}></div>
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-4xl mx-auto text-on-primary relative z-10">
 <h2 className="text-5xl md:text-6xl font-serif font-extrabold mb-8 tracking-tight">Ascend to Luxury</h2>
 <p className="text-2xl text-on-primary/90 mb-12 font-medium">Join an exclusive network of discerning buyers and sellers.</p>
 <Link to="/register" className="inline-flex items-center gap-3 px-12 py-6 bg-surface text-primary hover:bg-surface-dim rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.2)] interactive">
 Request Access <ArrowRight size={24} />
 </Link>
 </motion.div>
 </section>

 </PageTransition>
);
}
