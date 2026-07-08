import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
 Sparkles, Tag, PenTool, Search, FileText, FileSignature, 
 Copy, Download, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';

export default function AITools() {
 const [activeTab, setActiveTab] = useState('valuator');

 const tabs = [
 { id: 'valuator', label: 'Property Valuator', icon: Tag },
 { id: 'describer', label: 'Description Generator', icon: PenTool },
 { id: 'matcher', label: 'AI Property Matcher', icon: Search },
 { id: 'extractor', label: 'Clause Extractor', icon: FileText },
 { id: 'agreement', label: 'Agreement Generator', icon: FileSignature },
 ];

 return (
 <PageTransition className="bg-surface-dim min-h-screen py-10 px-4 transition-colors duration-200">
 <div className="max-w-6xl mx-auto">
 
 {/* Header */}
 <div className="mb-10 text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl mb-6 shadow-inner">
 <Sparkles size={32} />
 </div>
 <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">PropSense AI Suite</h1>
 <p className="mt-4 text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
 Leverage our proprietary AI models to valuate properties, generate captivating descriptions, analyze legal clauses, and automate agreements.
 </p>
 </div>

 {/* Tabs */}
 <div className="flex flex-wrap gap-2 mb-8 bg-surface p-2 rounded-2xl shadow-sm border border-outline-variant/30 justify-center">
 {tabs.map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
 activeTab === tab.id 
 ? 'bg-purple-600 text-white shadow-md' 
 : 'text-on-surface-variant hover:bg-gray-50 dark:hover:bg-surface-variant'
 }`}
 >
 <tab.icon size={18} /> <span className="hidden sm:inline">{tab.label}</span>
 </button>
))}
 </div>

 {/* Content Area */}
 <div className="bg-surface rounded-3xl shadow-xl border border-outline-variant/30 p-6 md:p-10 min-h-[600px]">
 {activeTab === 'valuator' && <ValuatorTool />}
 {activeTab === 'describer' && <DescriberTool />}
 {activeTab === 'matcher' && <MatcherTool />}
 {activeTab === 'extractor' && <ExtractorTool />}
 {activeTab === 'agreement' && <AgreementTool />}
 </div>
 </div>
 </PageTransition>
);
}


/* ==========================================================
 1. PROPERTY VALUATOR
========================================================== */
const ValuatorTool = () => {
 const [loading, setLoading] = useState(false);
 const [result, setResult] = useState(null);
 const [formData, setFormData] = useState({ type: 'apartment', bedrooms: '', bathrooms: '', sqft: '', yearBuilt: '', city: '', amenities: '' });

 const handleValuate = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 const response = await api.post('/ai/valuate', {
 ...formData,
 amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
 });
 // Backend returns { low, mid, high, confidence, rationale } directly
 setResult(response.data);
 toast.success("Valuation generated!");
 } catch (error) {
 toast.error("Failed to generate valuation.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div>
 <h2 className="text-2xl font-bold text-on-surface mb-6">Property Valuator</h2>
 <form onSubmit={handleValuate} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <select name="type" className="input-field" onChange={e => setFormData({...formData, type: e.target.value})}>
 <option value="apartment">Apartment</option><option value="villa">Villa</option>
 </select>
 <input type="text" placeholder="City / Neighborhood" required className="input-field" onChange={e => setFormData({...formData, city: e.target.value})} />
 <input type="number" placeholder="Bedrooms" required className="input-field" onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
 <input type="number" placeholder="Bathrooms" required className="input-field" onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
 <input type="number" placeholder="Area (SqFt)" required className="input-field" onChange={e => setFormData({...formData, sqft: e.target.value})} />
 <input type="number" placeholder="Year Built" required className="input-field" onChange={e => setFormData({...formData, yearBuilt: e.target.value})} />
 </div>
 <textarea placeholder="Amenities (e.g. Pool, Gym, Sea View)" rows="3" className="input-field resize-none" onChange={e => setFormData({...formData, amenities: e.target.value})}></textarea>
 
 <button type="submit" disabled={loading} className="w-full btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-500/30">
 {loading ? 'Analyzing Market Data...' : 'Generate AI Valuation'}
 </button>
 </form>
 </div>
 
 <div className="bg-surface-dim rounded-2xl p-6 border border-outline-variant/50">
 {result ? (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
 <div className="flex justify-between items-center">
 <h3 className="font-bold text-on-surface-variant uppercase tracking-wider">Estimated Value</h3>
 <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
 <ShieldCheck size={14}/> {result.confidence} Confidence
 </span>
 </div>
 <div className="text-center py-6 border-y border-outline-variant/50">
 <p className="text-5xl font-black text-on-surface">₹{result.mid?.toLocaleString('en-IN')}</p>
 <div className="flex justify-between items-center mt-6 text-sm font-bold text-on-surface-variant">
 <div><p className="uppercase text-xs mb-1">Low Range</p><p className="text-on-surface">₹{result.low?.toLocaleString('en-IN')}</p></div>
 <div><p className="uppercase text-xs mb-1">High Range</p><p className="text-on-surface">₹{result.high?.toLocaleString('en-IN')}</p></div>
 </div>
 </div>
 <div>
 <h4 className="font-bold text-on-surface mb-2 flex items-center gap-2"><Sparkles size={16} className="text-purple-500"/> AI Rationale</h4>
 <p className="text-sm text-on-surface-variant leading-relaxed bg-surface p-4 rounded-xl border border-outline-variant/30">{result.rationale}</p>
 </div>
 </div>
) : (
 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
 <Tag size={48} className="mb-4 opacity-20" />
 <p>Enter property details to see the AI valuation.</p>
 </div>
)}
 </div>
 </div>
);
};


/* ==========================================================
 2. DESCRIPTION GENERATOR
========================================================== */
const DescriberTool = () => {
 const [loading, setLoading] = useState(false);
 const [variants, setVariants] = useState(null);
 const [specs, setSpecs] = useState('');

 const handleDescribe = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 const response = await api.post('/ai/describe', { specs, imageUrls: [] });
 // Backend returns { short, medium, full } directly
 setVariants(response.data);
 toast.success("Descriptions generated!");
 } catch (error) {
 toast.error("Failed to generate description.");
 } finally {
 setLoading(false);
 }
 };

 const copyToClipboard = (text) => {
 navigator.clipboard.writeText(text);
 toast.success("Copied to clipboard!");
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div>
 <h2 className="text-2xl font-bold text-on-surface mb-6">Description Generator</h2>
 <form onSubmit={handleDescribe} className="space-y-4">
 <textarea 
 rows="8" 
 placeholder="Paste raw property specs here (e.g. 4 beds, 3 baths, large kitchen, needs paint, great neighborhood, near school...)" 
 className="input-field resize-none" 
 required
 onChange={e => setSpecs(e.target.value)}
 ></textarea>
 <button type="submit" disabled={loading} className="w-full btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-500/30">
 {loading ? 'Crafting Copy...' : 'Generate Descriptions'}
 </button>
 </form>
 </div>
 <div className="space-y-4">
 {!variants ? (
 <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 text-center bg-surface-dim rounded-2xl border border-outline-variant/50">
 <PenTool size={48} className="mb-4 opacity-20" />
 <p>AI will generate Short, Medium, and Full-length copy variants.</p>
 </div>
) : (
 ['short', 'medium', 'full'].map(variant => (
 <div key={variant} className="bg-surface-dim p-5 rounded-2xl border border-outline-variant/50 relative group animate-in fade-in slide-in-from-bottom-4">
 <h4 className="text-xs font-bold uppercase text-purple-600 mb-2">{variant} Version</h4>
 <p className="text-sm text-on-surface-variant leading-relaxed pr-8">{variants[variant]}</p>
 <button 
 onClick={() => copyToClipboard(variants[variant])}
 className="absolute top-4 right-4 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
 >
 <Copy size={16} />
 </button>
 </div>
))
)}
 </div>
 </div>
);
};


/* ==========================================================
 3. AI PROPERTY MATCHER
========================================================== */
const MatcherTool = () => {
 const [loading, setLoading] = useState(false);
 const [matches, setMatches] = useState([]);
 const [query, setQuery] = useState('');

 const handleMatch = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 const response = await api.post('/ai/match', { preferenceText: query });
 setMatches(response.data.matches || []);
 toast.success("Matches found!");
 } catch (error) {
 toast.error("Failed to find matches.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div>
 <div className="max-w-2xl mx-auto text-center mb-8">
 <h2 className="text-2xl font-bold text-on-surface mb-4">AI Property Matcher</h2>
 <form onSubmit={handleMatch} className="flex gap-2">
 <input 
 type="text" 
 placeholder="e.g. A quiet 2BHK near a park under 80 Lakhs..." 
 className="input-field flex-1" 
 required
 onChange={e => setQuery(e.target.value)}
 />
 <button type="submit" disabled={loading} className="px-8 btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-500/30 shrink-0">
 {loading ? 'Searching...' : 'Find Matches'}
 </button>
 </form>
 </div>

 {matches.length > 0 && (
 <motion.div 
 initial="hidden"
 animate="visible"
 variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4"
 >
 {matches.map((prop, i) => (
 <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
 <Link to={`/properties/${prop._id}`} className="block group bg-surface rounded-2xl border border-outline-variant/50 overflow-hidden hover:shadow-xl transition-shadow">
 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
 <div className="h-40 bg-surface-variant relative shrink-0">
 {prop.images?.[0]?.url && <img loading="lazy" decoding="async" src={prop.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
 <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
 <CheckCircle size={12}/> {prop.similarityScore || '95%'} Match
 </div>
 </div>
 <div className="p-4">
 <h4 className="font-bold text-on-surface truncate">{prop.title}</h4>
 <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1"><MapPin size={12}/>{prop.location?.city}</p>
 <p className="text-purple-600 dark:text-purple-400 font-extrabold mt-3">₹{prop.price?.toLocaleString('en-IN')}</p>
 </div>
 </motion.div>
 </Link>
 </motion.div>
))}
 </motion.div>
)}
 </div>
);
};


/* ==========================================================
 4. CLAUSE EXTRACTOR
========================================================== */
const ExtractorTool = () => {
 const [loading, setLoading] = useState(false);
 const [analysis, setAnalysis] = useState(null);
 const [docText, setDocText] = useState('');

 const handleExtract = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 const response = await api.post('/ai/extract-clauses', { text: docText });
 // Backend returns { clauses: { parties, salePrice, conditions, penalties, redFlags } }
 setAnalysis(response.data.clauses || response.data);
 toast.success("Analysis complete!");
 } catch (error) {
 toast.error("Failed to analyze document.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div>
 <h2 className="text-2xl font-bold text-on-surface mb-6">Legal Clause Extractor</h2>
 <form onSubmit={handleExtract} className="space-y-4">
 <textarea 
 rows="12" 
 placeholder="Paste agreement text here..." 
 className="input-field resize-none font-mono text-sm" 
 required
 onChange={e => setDocText(e.target.value)}
 ></textarea>
 <button type="submit" disabled={loading} className="w-full btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-500/30">
 {loading ? 'Analyzing Legalese...' : 'Extract Clauses'}
 </button>
 </form>
 </div>
 
 <div className="bg-surface-dim rounded-3xl p-6 border border-outline-variant/50">
 {!analysis ? (
 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
 <FileText size={48} className="mb-4 opacity-20" />
 <p>Paste text to extract key clauses, conditions, and red flags.</p>
 </div>
) : (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
 <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles size={20} className="text-purple-500"/> Extraction Results</h3>
 <div className="space-y-4">
 <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant/30">
 <h4 className="text-xs font-bold uppercase text-primary mb-1">Parties Involved</h4>
 <p className="text-sm font-medium">{analysis.parties}</p>
 </div>
 <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant/30">
 <h4 className="text-xs font-bold uppercase text-green-600 mb-1">Financial Terms</h4>
 <p className="text-sm font-medium">{analysis.salePrice}</p>
 </div>
 <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant/30">
 <h4 className="text-xs font-bold uppercase text-purple-600 mb-1">Conditions Precedent</h4>
 <p className="text-sm font-medium whitespace-pre-wrap">{analysis.conditions}</p>
 </div>
 <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
 <h4 className="text-xs font-bold uppercase text-red-600 mb-1 flex items-center gap-1"><AlertTriangle size={14}/> Red Flags / Penalties</h4>
 <p className="text-sm font-medium text-red-800 dark:text-red-300 whitespace-pre-wrap">{analysis.redFlags}</p>
 </div>
 </div>
 </div>
)}
 </div>
 </div>
);
};


/* ==========================================================
 5. AGREEMENT GENERATOR
========================================================== */
const AgreementTool = () => {
 const [loading, setLoading] = useState(false);
 const [agreement, setAgreement] = useState(null);
 const [formData, setFormData] = useState({ propertyTitle: '', buyerName: '', agentName: '', price: '', city: '', date: '' });

 const handleGenerate = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 const response = await api.post('/ai/generate-agreement', formData);
 // Backend returns { agreement }
 setAgreement(response.data.agreement || response.data.agreementText);
 toast.success("Agreement drafted!");
 } catch (error) {
 toast.error("Failed to generate agreement.");
 } finally {
 setLoading(false);
 }
 };

 const downloadAgreement = () => {
 const blob = new Blob([agreement], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `Agreement_${formData.buyerName.replace(/\s+/g, '_')}.txt`;
 a.click();
 URL.revokeObjectURL(url);
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div>
 <h2 className="text-2xl font-bold text-on-surface mb-6">Agreement Generator</h2>
 <form onSubmit={handleGenerate} className="space-y-4">
 <input type="text" placeholder="Property Title" required className="input-field" onChange={e => setFormData({...formData, propertyTitle: e.target.value})} />
 <div className="grid grid-cols-2 gap-4">
 <input type="text" placeholder="Buyer Name" required className="input-field" onChange={e => setFormData({...formData, buyerName: e.target.value})} />
 <input type="text" placeholder="Agent Name" required className="input-field" onChange={e => setFormData({...formData, agentName: e.target.value})} />
 <input type="number" placeholder="Price (₹)" required className="input-field" onChange={e => setFormData({...formData, price: e.target.value})} />
 <input type="text" placeholder="City" required className="input-field" onChange={e => setFormData({...formData, city: e.target.value})} />
 <input type="date" required className="input-field col-span-2" onChange={e => setFormData({...formData, date: e.target.value})} />
 </div>
 
 <button type="submit" disabled={loading} className="w-full btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-500/30 flex justify-center items-center gap-2">
 {loading ? 'Drafting Legal Document...' : <><FileSignature size={18}/> Draft Agreement</>}
 </button>
 </form>
 </div>
 
 <div className="bg-surface-dim rounded-3xl p-1 border border-outline-variant/50 flex flex-col h-[500px]">
 {!agreement ? (
 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
 <FileSignature size={48} className="mb-4 opacity-20" />
 <p>Fill out the form to instantly generate a draft agreement.</p>
 </div>
) : (
 <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
 <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface rounded-t-3xl">
 <h3 className="font-bold flex items-center gap-2 text-purple-600"><Sparkles size={18}/> AI Draft Ready</h3>
 <button onClick={downloadAgreement} className="p-2 text-on-surface-variant hover:text-purple-600 bg-surface-variant rounded-lg transition-colors">
 <Download size={18} />
 </button>
 </div>
 <div className="flex-1 overflow-y-auto p-6 bg-surface/50 custom-scrollbar">
 <pre className="font-sans text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
 {agreement}
 </pre>
 </div>
 </div>
)}
 </div>
 </div>
);
};
