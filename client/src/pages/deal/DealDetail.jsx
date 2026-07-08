import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { 
 fetchDealById, updateDealStatus, updateDealOffer, 
 uploadDealDocument, deleteDealDocument 
} from '../../features/deal/dealSlice';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
 ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, 
 UploadCloud, Trash2, Sparkles, Download, Edit3, Briefcase, FileSignature
} from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

const STATUS_COLORS = {
 pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500',
 accepted: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500',
 in_progress: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-500',
 completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-500',
 rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-500',
 cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-surface-variant '
};

export default function DealDetail() {
 const { id } = useParams();
 const dispatch = useDispatch();
 const { selected: deal, loading } = useSelector((state) => state.deal);
 const { user } = useSelector((state) => state.auth);

 // AI and Modal States
 const [isAiLoading, setIsAiLoading] = useState(false);
 const [extractedClauses, setExtractedClauses] = useState(null);
 const [generatedAgreement, setGeneratedAgreement] = useState(null);
 const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
 const [newOfferAmount, setNewOfferAmount] = useState('');
 const fileInputRef = useRef(null);

 useEffect(() => {
 dispatch(fetchDealById(id));
 }, [dispatch, id]);

 // Timeline Handlers
 const handleStatusChange = async (e) => {
 const newStatus = e.target.value;
 const result = await dispatch(updateDealStatus({ id, status: newStatus }));
 if (updateDealStatus.fulfilled.match(result)) {
 toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
 } else {
 toast.error("Failed to update status.");
 }
 };

 const handleCounterOffer = async (e) => {
 e.preventDefault();
 if (!newOfferAmount) return;
 const result = await dispatch(updateDealOffer({ id, offerAmount: newOfferAmount }));
 if (updateDealOffer.fulfilled.match(result)) {
 toast.success("Offer updated successfully!");
 setIsOfferModalOpen(false);
 setNewOfferAmount('');
 } else {
 toast.error("Failed to update offer.");
 }
 };

 // Document Handlers
 const handleFileUpload = async (e) => {
 const file = e.target.files[0];
 if (!file) return;

 const formData = new FormData();
 formData.append('file', file);

 const toastId = toast.loading('Uploading document...');
 const result = await dispatch(uploadDealDocument({ id, documentData: formData }));
 
 if (uploadDealDocument.fulfilled.match(result)) {
 toast.success('Document uploaded!', { id: toastId });
 } else {
 toast.error('Failed to upload document.', { id: toastId });
 }
 };

 const handleDeleteDoc = async (docId) => {
 if (!window.confirm("Are you sure you want to delete this document?")) return;
 const result = await dispatch(deleteDealDocument({ id, docId }));
 if (deleteDealDocument.fulfilled.match(result)) toast.success("Document deleted.");
 };

 // AI Handlers
 const handleExtractClauses = async (docUrl) => {
 setIsAiLoading(true);
 const toastId = toast.loading('PropSense AI is analyzing the document...');
 try {
 const response = await api.post('/ai/extract-clauses', { text: docUrl });
 setExtractedClauses(response.data.clauses || response.data);
 toast.success('Analysis complete!', { id: toastId });
 } catch (error) {
 toast.error("Failed to extract clauses.", { id: toastId });
 } finally {
 setIsAiLoading(false);
 }
 };

 const handleGenerateAgreement = async () => {
 setIsAiLoading(true);
 const toastId = toast.loading('PropSense AI is drafting the agreement...');
 try {
 const response = await api.post('/ai/generate-agreement', {
 dealId: id,
 propertyTitle: deal?.property?.title,
 buyerName: deal?.buyer?.name,
 agentName: deal?.agent?.name,
 price: deal?.offeredPrice,
 city: deal?.property?.address?.city || '',
 date: new Date().toLocaleDateString('en-IN'),
 });
 setGeneratedAgreement(response.data.agreement || response.data.agreementText);
 toast.success('Draft ready!', { id: toastId });
 } catch (error) {
 toast.error("Failed to generate agreement.", { id: toastId });
 } finally {
 setIsAiLoading(false);
 }
 };

 const handleDownloadBundle = async () => {
 const toastId = toast.loading('Preparing document bundle...');
 try {
 const response = await api.get(`/deals/${id}/bundle`, { responseType: 'blob' });
 const url = window.URL.createObjectURL(new Blob([response.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `Deal_Bundle_${deal?.property?.title?.replace(/\s+/g, '_') || id}.zip`);
 document.body.appendChild(link);
 link.click();
 link.remove();
 toast.success('Download started!', { id: toastId });
 } catch (error) {
 toast.error("Failed to download bundle.", { id: toastId });
 }
 };

 const downloadAgreement = () => {
 if (!generatedAgreement) return;
 const blob = new Blob([generatedAgreement], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `Draft_Agreement_${deal?.property?.title?.replace(/\s+/g, '_') || 'document'}.txt`;
 a.click();
 URL.revokeObjectURL(url);
 };

 if (loading || !deal) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <Skeleton height={200} className="rounded-3xl mb-8 dark:bg-surface-variant" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <Skeleton height={500} className="rounded-3xl dark:bg-surface-variant" />
 <Skeleton height={500} className="rounded-3xl dark:bg-surface-variant" />
 <Skeleton height={500} className="rounded-3xl dark:bg-surface-variant" />
 </div>
 </div>
);
 }

 return (
 <PageTransition className="bg-surface-dim min-h-screen pb-24 transition-colors duration-200">
 {/* Top Bar */}
 <div className="bg-surface border-b border-outline-variant/50 py-6 px-4 sticky top-0 z-30 shadow-sm">
 <div className="max-w-7xl mx-auto flex items-center justify-between">
 <Link to="/deals" className="flex items-center gap-2 text-on-surface-variant hover:text-gray-900 dark:hover:text-white font-bold transition-colors">
 <ArrowLeft size={20} /> Back to My Deals
 </Link>
 <div className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider border ${STATUS_COLORS[deal.status] || STATUS_COLORS.pending}`}>
 {deal.status.replace('_', ' ')}
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* ==========================================
 LEFT COLUMN: PROPERTY & PARTIES SUMMARY
 ========================================== */}
 <div className="lg:col-span-3 space-y-6">
 {/* Property Summary */}
 <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30">
 <div className="h-40 bg-surface-variant relative">
 {deal.property?.images?.[0]?.url ? (
 <img loading="lazy" decoding="async" src={deal.property.images[0].url} alt="Property" className="w-full h-full object-cover" />
) : (
 <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
)}
 </div>
 <div className="p-5 border-b border-outline-variant/30">
 <h3 className="font-extrabold text-lg text-on-surface line-clamp-2">{deal.property?.title}</h3>
 <p className="text-sm text-on-surface-variant mt-1">{deal.property?.address?.city}</p>
 <Link to={`/properties/${deal.property?._id}`} className="mt-3 inline-block text-sm font-bold text-primary hover:underline">View Listing</Link>
 </div>
 <div className="p-5 bg-surface-dim/50">
 <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Current Offer</p>
 <p className="text-3xl font-black text-primary">₹{deal.offeredPrice?.toLocaleString('en-IN')}</p>
 {deal.finalPrice && (
 <div className="mt-3 pt-3 border-t border-outline-variant/50">
 <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Final Agreed Price</p>
 <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{deal.finalPrice?.toLocaleString('en-IN')}</p>
 </div>
)}
 </div>
 </div>

 {/* Parties */}
 <div className="bg-surface rounded-3xl p-5 shadow-sm border border-outline-variant/30">
 <h3 className="font-bold text-on-surface mb-4 border-b border-outline-variant/30 pb-2">Parties Involved</h3>
 
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
 {deal.buyer?.avatar ? <img loading="lazy" decoding="async" src={deal.buyer.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-primary" />}
 </div>
 <div>
 <p className="text-xs font-bold text-on-surface-variant uppercase">Buyer</p>
 <p className="font-semibold text-on-surface">{deal.buyer?.name}</p>
 </div>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
 {deal.agent?.avatar ? <img loading="lazy" decoding="async" src={deal.agent.avatar} className="w-full h-full object-cover" /> : <Briefcase size={20} className="text-purple-600" />}
 </div>
 <div>
 <p className="text-xs font-bold text-on-surface-variant uppercase">Agent</p>
 <p className="font-semibold text-on-surface">{deal.agent?.name}</p>
 </div>
 </div>
 </div>
 </div>

 {/* ==========================================
 CENTER COLUMN: TIMELINE & ACTIONS
 ========================================== */}
 <div className="lg:col-span-5 bg-surface rounded-3xl shadow-sm border border-outline-variant/30 p-6 flex flex-col">
 <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
 <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
 <Clock size={20} className="text-blue-500" /> Deal Timeline
 </h2>
 
 {/* Agent Status Control */}
 {user?.role === 'agent' && deal.status !== 'completed' && deal.status !== 'cancelled' && (
 <select 
 value={deal.status} 
 onChange={handleStatusChange}
 className="px-3 py-1.5 bg-surface-dim border border-outline-variant/50 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none text-on-surface capitalize cursor-pointer shadow-sm"
 >
 <option value="pending">Pending</option>
 <option value="accepted">Accept Offer</option>
 <option value="in_progress">In Progress</option>
 <option value="completed">Complete Deal</option>
 <option value="rejected">Reject Offer</option>
 </select>
)}
 </div>

 {/* Timeline List */}
 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
 {deal.timeline?.map((event, index) => (
 <div key={event._id || index} className="relative pl-6">
 {/* Line */}
 {index !== deal.timeline.length - 1 && (
 <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-surface-variant"></div>
)}
 {/* Dot */}
 <div className="absolute left-0 top-1.5 w-[24px] h-[24px] bg-blue-100 dark:bg-blue-900/30 rounded-full border-4 border-white z-10 flex items-center justify-center">
 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
 </div>
 
 <div>
 <p className="font-bold text-on-surface">{event.event}</p>
 <div className="flex items-center gap-2 mt-1">
 <p className="text-xs text-on-surface-variant font-medium">
 {new Date(event.createdAt || event.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
 </p>
 {event.createdBy && (
 <>
 <span className="text-gray-300">•</span>
 <p className="text-xs text-on-surface-variant">by {event.createdBy.name || event.createdBy}</p>
 </>
)}
 </div>
 </div>
 </div>
))}
 </div>

 {/* Counter Offer Action */}
 {deal.status !== 'completed' && deal.status !== 'cancelled' && deal.status !== 'rejected' && (
 <div className="mt-8 pt-6 border-t border-outline-variant/30">
 <button 
 onClick={() => setIsOfferModalOpen(true)}
 className="w-full py-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
 >
 <Edit3 size={18} /> Make Counter Offer
 </button>
 </div>
)}
 </div>

 {/* ==========================================
 RIGHT COLUMN: DOCUMENT VAULT & AI
 ========================================== */}
 <div className="lg:col-span-4 space-y-6 flex flex-col">
 
 {/* Generate Agreement Card */}
 <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 shadow-lg text-white">
 <div className="flex items-center gap-2 mb-2">
 <Sparkles size={20} className="text-purple-200" />
 <h3 className="font-extrabold text-xl">PropSense AI Drafter</h3>
 </div>
 <p className="text-sm text-purple-100 mb-6 leading-relaxed">
 Instantly generate a personalized, draft purchase agreement based on the current deal parameters.
 </p>
 <button 
 onClick={handleGenerateAgreement}
 disabled={isAiLoading}
 className="w-full py-3 bg-white text-purple-700 font-extrabold rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-80 disabled:hover:translate-y-0"
 >
 {isAiLoading ? 'Drafting...' : <><FileSignature size={18} /> Generate Agreement</>}
 </button>
 </div>

 {/* Document Vault */}
 <div className="bg-surface rounded-3xl shadow-sm border border-outline-variant/30 p-6 flex-1 flex flex-col">
 <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
 <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
 <FileText size={20} className="text-green-500" /> Document Vault
 </h2>
 <div className="flex items-center gap-2">
 {deal.documents?.length > 0 && (
 <button 
 onClick={handleDownloadBundle}
 className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg hover:bg-blue-100 transition-colors"
 title="Download All (ZIP)"
 >
 <Download size={20} />
 </button>
)}
 <button 
 onClick={() => fileInputRef.current?.click()}
 className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition-colors"
 title="Upload Document"
 >
 <UploadCloud size={20} />
 </button>
 </div>
 <input 
 type="file" 
 ref={fileInputRef} 
 className="hidden" 
 onChange={handleFileUpload} 
 accept=".pdf,.doc,.docx,.jpg,.png"
 />
 </div>

 <div className="flex-1 overflow-y-auto space-y-4">
 {deal.documents?.length > 0 ? (
 deal.documents.map((doc) => (
 <div key={doc._id} className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-dim/50 hover:border-blue-200 transition-colors group">
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-3 overflow-hidden">
 <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/50">
 <FileText size={20} className="text-blue-500" />
 </div>
 <div className="min-w-0">
 <p className="font-bold text-sm text-on-surface truncate">{doc.name}</p>
 <p className="text-xs text-on-surface-variant">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
 </div>
 </div>
 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-primary transition-colors">
 <Download size={16} />
 </a>
 <button onClick={() => handleDeleteDoc(doc._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 
 {/* AI Extract Button for PDF/Docs */}
 <button 
 onClick={() => handleExtractClauses(doc.url)}
 className="w-full py-2 bg-surface border border-purple-100 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex justify-center items-center gap-1.5 shadow-sm"
 >
 <Sparkles size={14} /> AI Analyze Clauses
 </button>
 </div>
))
) : (
 <div className="text-center py-10">
 <p className="text-on-surface-variant text-sm">No documents uploaded yet.</p>
 </div>
)}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* MODALS */}

 {/* Counter Offer Modal */}
 {isOfferModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-surface rounded-3xl p-8 w-full max-w-sm shadow-2xl relative border border-outline-variant/30">
 <button onClick={() => setIsOfferModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
 <XCircle size={24} />
 </button>
 <h2 className="text-2xl font-bold text-on-surface mb-2">Counter Offer</h2>
 <p className="text-sm text-on-surface-variant mb-6">Submit a new price for this deal.</p>
 
 <form onSubmit={handleCounterOffer}>
 <div className="mb-6">
 <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">New Amount (₹)</label>
 <input
 type="number"
 value={newOfferAmount}
 onChange={(e) => setNewOfferAmount(e.target.value)}
 placeholder={deal.offeredPrice}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface"
 required
 />
 </div>
 <button type="submit" className="w-full py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
 Submit Offer
 </button>
 </form>
 </div>
 </div>
)}

 {/* AI Clauses Analysis Modal */}
 {extractedClauses && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-surface rounded-3xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative border border-outline-variant/30 custom-scrollbar">
 <button onClick={() => setExtractedClauses(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-surface-variant rounded-full p-1">
 <XCircle size={24} />
 </button>
 <h2 className="text-2xl font-extrabold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
 <Sparkles size={24} className="text-purple-500" /> AI Document Analysis
 </h2>
 
 <div className="space-y-6">
 <div>
 <h4 className="font-bold text-on-surface mb-2 uppercase text-xs tracking-wider text-purple-600">Parties</h4>
 <p className="text-on-surface-variant font-medium bg-surface-variant/50 p-4 rounded-xl">{extractedClauses.parties ||"No specific parties detected."}</p>
 </div>
 <div>
 <h4 className="font-bold text-on-surface mb-2 uppercase text-xs tracking-wider text-green-600">Sale Price / Terms</h4>
 <p className="text-on-surface-variant font-medium bg-surface-variant/50 p-4 rounded-xl">{extractedClauses.salePrice ||"No price clauses detected."}</p>
 </div>
 <div>
 <h4 className="font-bold text-on-surface mb-2 uppercase text-xs tracking-wider text-primary">Conditions</h4>
 <p className="text-on-surface-variant font-medium bg-surface-variant/50 p-4 rounded-xl whitespace-pre-wrap">{extractedClauses.conditions ||"No special conditions detected."}</p>
 </div>
 <div>
 <h4 className="font-bold text-on-surface mb-2 uppercase text-xs tracking-wider text-red-600">Red Flags / Penalties</h4>
 <p className="text-on-surface-variant font-medium bg-red-50 dark:bg-red-900/10 p-4 rounded-xl whitespace-pre-wrap">{extractedClauses.redFlags ||"No obvious red flags detected."}</p>
 </div>
 </div>
 </div>
 </div>
)}

 {/* Generated Agreement Modal */}
 {generatedAgreement && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-surface rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative border border-outline-variant/30">
 <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4 shrink-0">
 <h2 className="text-2xl font-extrabold text-on-surface flex items-center gap-2">
 <FileSignature size={24} className="text-blue-500" /> AI Generated Agreement
 </h2>
 <button onClick={() => setGeneratedAgreement(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-surface-variant rounded-full p-1">
 <XCircle size={24} />
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto mb-6 p-6 bg-surface-dim rounded-2xl border border-outline-variant/50 custom-scrollbar">
 <pre className="whitespace-pre-wrap font-sans text-sm text-on-surface-variant leading-relaxed">
 {generatedAgreement}
 </pre>
 </div>

 <div className="shrink-0 pt-4 border-t border-outline-variant/30">
 <button onClick={downloadAgreement} className="w-full py-4 bg-gray-900 dark:bg-white text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg">
 <Download size={20} /> Download as TXT
 </button>
 </div>
 </div>
 </div>
)}

 </PageTransition>
);
}
