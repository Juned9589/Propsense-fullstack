import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import PageTransition from '../../components/common/PageTransition';

export default function ResetPassword() {
 // Extract token from URL (e.g., /reset-password/abc123token)
 const { token: urlToken } = useParams();
 const navigate = useNavigate();
 const { register, handleSubmit, formState: { errors } } = useForm();
 const [loading, setLoading] = useState(false);

 const onSubmit = async (data) => {
 // Use the token from the URL if present, otherwise use the manual input
 const finalToken = urlToken || data.token;

 if (!finalToken) {
 toast.error('A reset token is required.');
 return;
 }

 setLoading(true);
 try {
 await api.post(`/auth/reset-password/${finalToken}`, { password: data.password });
 toast.success('Password has been reset successfully!');
 navigate('/login');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to reset password. The token might be invalid or expired.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <PageTransition className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
 <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-outline-variant/30">
 <div>
 <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-on-surface">
 Reset Password
 </h2>
 <p className="mt-2 text-center text-sm text-on-surface-variant">
 Create a new, strong password below.
 </p>
 </div>
 
 <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
 <div className="space-y-4">
 {/* Token Field: Only show if the token isn't provided in the URL params */}
 {!urlToken && (
 <div>
 <label htmlFor="token" className="sr-only">Reset Token</label>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <KeyRound className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="token"
 type="text"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="Paste reset token here"
 {...register('token', { required: 'Token is required' })}
 />
 </div>
 {errors.token && <p className="mt-1 text-xs text-red-500">{errors.token.message}</p>}
 </div>
)}

 {/* Password Field */}
 <div>
 <label htmlFor="password" className="sr-only">New Password</label>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="password"
 type="password"
 autoComplete="new-password"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="New Password"
 {...register('password', { 
 required: 'Password is required',
 minLength: { value: 6, message: 'Password must be at least 6 characters' }
 })}
 />
 </div>
 {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
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
 Resetting...
 </span>
) : (
 'Reset Password'
)}
 </button>
 </div>
 </form>
 
 <div className="mt-6 flex items-center justify-center">
 <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-primary hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
 <ArrowLeft className="h-4 w-4" />
 Back to login
 </Link>
 </div>
 </div>
 </PageTransition>
);
}
