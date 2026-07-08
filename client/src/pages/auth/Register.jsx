import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUser } from '../../features/auth/authSlice';
import { User, Mail, Phone, Lock, Briefcase } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

export default function Register() {
 const { register, handleSubmit, formState: { errors } } = useForm({
 defaultValues: {
 role: '' // Ensures the"Select Role" placeholder works properly
 }
 });
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const { loading } = useSelector((state) => state.auth);

 const onSubmit = async (data) => {
 try {
 // Dispatch the registerUser thunk we created earlier
 const resultAction = await dispatch(registerUser(data));
 
 // If fulfilled, Redux automatically handles the token in state & localStorage
 if (registerUser.fulfilled.match(resultAction)) {
 toast.success('Registration successful!');
 navigate('/'); // Redirect to home/dashboard
 } else {
 toast.error(resultAction.payload || 'Registration failed. Please try again.');
 }
 } catch (error) {
 toast.error('An unexpected error occurred. Please try again.');
 }
 };

 return (
 <PageTransition className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
 <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-outline-variant/30">
 <div>
 <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-on-surface">
 Create an account
 </h2>
 <p className="mt-2 text-center text-sm text-on-surface-variant">
 Join PropSense to find your dream property
 </p>
 </div>
 
 <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
 <div className="space-y-4">
 {/* Name Field */}
 <div>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="name"
 type="text"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="Full Name"
 {...register('name', { required: 'Name is required' })}
 />
 </div>
 {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
 </div>

 {/* Email Field */}
 <div>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="email"
 type="email"
 autoComplete="email"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="Email address"
 {...register('email', { 
 required: 'Email is required',
 pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
 })}
 />
 </div>
 {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
 </div>

 {/* Phone Field */}
 <div>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="phone"
 type="tel"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="Phone Number"
 {...register('phone', { required: 'Phone number is required' })}
 />
 </div>
 {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
 </div>

 {/* Password Field */}
 <div>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="password"
 type="password"
 autoComplete="new-password"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="Password"
 {...register('password', { 
 required: 'Password is required',
 minLength: { value: 6, message: 'Password must be at least 6 characters' }
 })}
 />
 </div>
 {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
 </div>

 {/* Role Selection */}
 <div>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Briefcase className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <select
 id="role"
 className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 {...register('role', { required: 'Role is required' })}
 >
 <option value="" disabled className="text-gray-400">Select your role</option>
 <option value="buyer">Buyer</option>
 <option value="agent">Agent</option>
 </select>
 </div>
 {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
 </div>
 </div>

 <div>
 <button
 type="submit"
 disabled={loading}
 className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-900 transition-all"
 >
 {loading ? (
 <span className="flex items-center gap-2">
 <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 Creating account...
 </span>
) : (
 'Sign up'
)}
 </button>
 </div>
 </form>
 
 <div className="mt-6 text-center text-sm text-on-surface-variant">
 Already have an account?{' '}
 <Link to="/login" className="font-semibold text-primary hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
 Log in
 </Link>
 </div>
 </div>
 </PageTransition>
);
}
