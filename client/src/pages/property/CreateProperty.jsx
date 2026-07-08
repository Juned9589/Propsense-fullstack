import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../../features/property/propertySlice';
import { toast } from 'react-hot-toast';
import { 
 Home, List, MapPin, Image as ImageIcon, CheckCircle, 
 ChevronRight, ChevronLeft, UploadCloud, X
} from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

const PROPERTY_TYPES = ["apartment","villa","plot","commercial","flat"];
const STATUS_OPTIONS = ["available","under_offer","sold"];
const AMENITIES_LIST = ["Parking","Pool","Gym","Security","Garden","Furnished","Balcony","Elevator"];

export default function CreateProperty() {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const { loading } = useSelector((state) => state.property);
 const { user } = useSelector((state) => state.auth);

 // Redirect non-agents
 React.useEffect(() => {
 if (user && user.role !== 'agent' && user.role !== 'admin') {
 toast.error("Access denied. Only agents can list properties.");
 navigate('/');
 }
 }, [user, navigate]);

 const [currentStep, setCurrentStep] = useState(1);
 const totalSteps = 4;

 const [formData, setFormData] = useState({
 title: '',
 price: '',
 type: 'apartment',
 status: 'available',
 description: '',
 bedrooms: '',
 bathrooms: '',
 sqft: '',
 yearBuilt: '',
 amenities: [],
 location: {
 address: '',
 city: '',
 state: '',
 zipCode: '',
 lat: '',
 lng: ''
 }
 });

 const [images, setImages] = useState([]);
 const [imagePreviews, setImagePreviews] = useState([]);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleLocationChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({
 ...prev,
 location: { ...prev.location, [name]: value }
 }));
 };

 const handleAmenityToggle = (amenity) => {
 setFormData(prev => ({
 ...prev,
 amenities: prev.amenities.includes(amenity)
 ? prev.amenities.filter(a => a !== amenity)
 : [...prev.amenities, amenity]
 }));
 };

 const handleImageChange = (e) => {
 const files = Array.from(e.target.files);
 if (files.length === 0) return;

 setImages(prev => [...prev, ...files]);
 
 const previews = files.map(file => URL.createObjectURL(file));
 setImagePreviews(prev => [...prev, ...previews]);
 };

 const removeImage = (index) => {
 setImages(prev => prev.filter((_, i) => i !== index));
 setImagePreviews(prev => {
 // Revoke the object URL to avoid memory leaks
 URL.revokeObjectURL(prev[index]);
 return prev.filter((_, i) => i !== index);
 });
 };

 const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
 const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

 const handleSubmit = async (e) => {
 e.preventDefault();
 
 // Use FormData to support multipart form data (Images + Text)
 const submitData = new FormData();
 
 submitData.append('title', formData.title);
 submitData.append('price', formData.price);
 submitData.append('type', formData.type);
 submitData.append('status', formData.status);
 submitData.append('description', formData.description);
 submitData.append('bedrooms', formData.bedrooms);
 submitData.append('bathrooms', formData.bathrooms);
 submitData.append('sqft', formData.sqft);
 submitData.append('yearBuilt', formData.yearBuilt);
 
 // Backend expects address as a JSON string: { address, city, state, zipCode }
 submitData.append('address', JSON.stringify({
 address: formData.location.address,
 city: formData.location.city,
 state: formData.location.state,
 zipCode: formData.location.zipCode,
 }));

 // Backend expects lat/lng as top-level fields
 if (formData.location.lat) submitData.append('lat', formData.location.lat);
 if (formData.location.lng) submitData.append('lng', formData.location.lng);
 
 // Backend expects JSON string for amenities
 submitData.append('amenities', JSON.stringify(formData.amenities));
 
 // Append images
 images.forEach(image => {
 submitData.append('images', image);
 });

 const result = await dispatch(createProperty(submitData));
 if (createProperty.fulfilled.match(result)) {
 toast.success("Property listed successfully!");
 navigate('/dashboard/agent');
 } else {
 toast.error(result.payload?.message ||"Failed to list property.");
 }
 };

 const steps = [
 { id: 1, title: 'Basic Info', icon: Home },
 { id: 2, title: 'Details', icon: List },
 { id: 3, title: 'Location', icon: MapPin },
 { id: 4, title: 'Images', icon: ImageIcon }
 ];

 return (
 <PageTransition className="min-h-screen bg-surface-dim py-12 px-4 transition-colors duration-200">
 <div className="max-w-3xl mx-auto">
 
 {/* Header & Progress */}
 <div className="mb-10 text-center">
 <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">List a New Property</h1>
 <p className="mt-2 text-on-surface-variant">Add the details below to create a new public listing.</p>
 </div>

 {/* Stepper UI */}
 <div className="mb-10 relative">
 <div className="absolute top-1/2 left-0 right-0 h-1 bg-surface-variant -translate-y-1/2 rounded-full z-0"></div>
 <div 
 className="absolute top-1/2 left-0 h-1 bg-primary text-on-primary -translate-y-1/2 rounded-full z-0 transition-all duration-300"
 style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
 ></div>
 
 <div className="flex justify-between relative z-10">
 {steps.map((step) => (
 <div key={step.id} className="flex flex-col items-center">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
 currentStep >= step.id 
 ? 'bg-primary text-on-primary text-white shadow-lg shadow-blue-500/30' 
 : 'bg-surface text-gray-400 border-2 border-outline-variant/50'
 }`}>
 {currentStep > step.id ? <CheckCircle size={20} /> : <step.icon size={18} />}
 </div>
 <span className={`mt-2 text-xs font-semibold ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'}`}>
 {step.title}
 </span>
 </div>
))}
 </div>
 </div>

 {/* Form Container */}
 <div className="bg-surface rounded-3xl shadow-xl border border-outline-variant/30 p-6 md:p-10">
 <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
 
 {/* STEP 1: BASIC INFO */}
 {currentStep === 1 && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <h2 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Basic Information</h2>
 
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Listing Title <span className="text-red-500">*</span></label>
 <input 
 type="text" name="title" required value={formData.title} onChange={handleChange}
 placeholder="e.g. Luxury Sea View Apartment"
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface transition-all shadow-inner"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Description</label>
 <textarea 
 name="description" rows="4" value={formData.description} onChange={handleChange}
 placeholder="Detailed description of the property..."
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface transition-all shadow-inner resize-none"
 ></textarea>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Price (₹) <span className="text-red-500">*</span></label>
 <input 
 type="number" name="price" required value={formData.price} onChange={handleChange}
 placeholder="e.g. 15000000"
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface transition-all shadow-inner"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Property Type</label>
 <select 
 name="type" value={formData.type} onChange={handleChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface capitalize transition-all"
 >
 {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
 </select>
 </div>
 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Listing Status</label>
 <select 
 name="status" value={formData.status} onChange={handleChange}
 className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface capitalize transition-all"
 >
 {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
 </select>
 </div>
 </div>
 </div>
)}

 {/* STEP 2: DETAILS */}
 {currentStep === 2 && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <h2 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Property Details</h2>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Bedrooms</label>
 <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Bathrooms</label>
 <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Area (SqFt)</label>
 <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Year Built</label>
 <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 </div>

 <div className="pt-4">
 <label className="block text-sm font-bold text-on-surface-variant mb-4">Amenities</label>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
 {AMENITIES_LIST.map(amenity => (
 <div 
 key={amenity}
 onClick={() => handleAmenityToggle(amenity)}
 className={`px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-colors text-center ${
 formData.amenities.includes(amenity)
 ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-sm'
 : 'bg-white border-gray-200 text-on-surface-variant hover:border-blue-300 dark:hover:border-blue-800'
 }`}
 >
 {amenity}
 </div>
))}
 </div>
 </div>
 </div>
)}

 {/* STEP 3: LOCATION */}
 {currentStep === 3 && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <h2 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Location Information</h2>
 
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Street Address <span className="text-red-500">*</span></label>
 <input type="text" name="address" required value={formData.location.address} onChange={handleLocationChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">City <span className="text-red-500">*</span></label>
 <input type="text" name="city" required value={formData.location.city} onChange={handleLocationChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">State</label>
 <input type="text" name="state" value={formData.location.state} onChange={handleLocationChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Zip Code</label>
 <input type="text" name="zipCode" value={formData.location.zipCode} onChange={handleLocationChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6 pt-4">
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Latitude (Map)</label>
 <input type="number" step="any" name="lat" value={formData.location.lat} onChange={handleLocationChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 <div>
 <label className="block text-sm font-bold text-on-surface-variant mb-2">Longitude (Map)</label>
 <input type="number" step="any" name="lng" value={formData.location.lng} onChange={handleLocationChange} className="w-full px-4 py-3 bg-surface-dim border border-outline-variant/50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-on-surface" />
 </div>
 </div>
 </div>
)}

 {/* STEP 4: IMAGES */}
 {currentStep === 4 && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <h2 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Upload Images</h2>
 
 <div className="border-2 border-dashed border-gray-300 rounded-3xl p-10 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-surface-dim/50 relative">
 <input 
 type="file" 
 multiple 
 accept="image/png, image/jpeg, image/webp" 
 onChange={handleImageChange}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
 />
 <div className="flex flex-col items-center justify-center space-y-4">
 <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center">
 <UploadCloud size={32} />
 </div>
 <div>
 <p className="text-lg font-bold text-on-surface">Click or drag images to upload</p>
 <p className="text-sm text-on-surface-variant mt-1">Supports JPG, PNG, WEBP. Max size 5MB per image.</p>
 </div>
 <button type="button" className="px-6 py-2 bg-surface border border-outline-variant/50 text-on-surface font-bold rounded-lg shadow-sm pointer-events-none">
 Browse Files
 </button>
 </div>
 </div>

 {/* Previews */}
 {imagePreviews.length > 0 && (
 <div className="mt-8">
 <h3 className="text-sm font-bold text-on-surface-variant mb-4">Selected Images ({imagePreviews.length})</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
 {imagePreviews.map((src, index) => (
 <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-sm group">
 <img loading="lazy" decoding="async" src={src} alt="preview" className="w-full h-full object-cover" />
 <button 
 type="button" 
 onClick={() => removeImage(index)}
 className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
 >
 <X size={16} />
 </button>
 </div>
))}
 </div>
 </div>
)}
 </div>
)}

 {/* Navigation Buttons */}
 <div className="mt-10 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
 <button 
 type="button" 
 onClick={prevStep}
 disabled={currentStep === 1}
 className="flex items-center gap-2 px-6 py-3 font-bold text-on-surface-variant hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-0"
 >
 <ChevronLeft size={20} /> Back
 </button>
 
 {currentStep < totalSteps ? (
 <button 
 type="button" 
 onClick={nextStep}
 className="flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
 >
 Next Step <ChevronRight size={20} />
 </button>
) : (
 <button 
 type="submit" 
 disabled={loading}
 className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-green-500/30 disabled:opacity-70 disabled:hover:scale-100"
 >
 {loading ? (
 <>
 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
 Publishing...
 </>
) : (
 <>Publish Listing <CheckCircle size={20} /></>
)}
 </button>
)}
 </div>
 </form>
 </div>
 </div>
 </PageTransition>
);
}
