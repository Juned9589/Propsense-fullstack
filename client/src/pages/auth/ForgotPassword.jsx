import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../../api/axios'; // Using the configured axios instance directly since we don't have this in Redux yet
import PageTransition from '../../components/common/PageTransition';

export default function ForgotPassword() {
 const { register, handleSubmit, formState: { errors } } = useForm();
 const [loading, setLoading] = useState(false);
 const [isSubmitted, setIsSubmitted] = useState(false);

 const onSubmit = async (data) => {
 setLoading(true);
 try {
 const response = await api.post('/auth/forgot-password', { email: data.email });
 
 setIsSubmitted(true);
 toast.success('Password reset email sent!');
 
 // Dev Mode Feature: Show the token in toast if returned by the backend
 if (response.data && response.data.resetToken) {
 toast(`Dev Mode Token: ${response.data.resetToken}`, {
 icon: '🛠️',
 duration: 6000,
 });
 }
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to process request. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <PageTransition className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
 <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-outline-variant/30">
 <div>
 <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-on-surface">
 Forgot Password
 </h2>
 <p className="mt-2 text-center text-sm text-on-surface-variant">
 {isSubmitted 
 ?"Check your email for the reset instructions." 
 :"Enter your email and we'll send you a reset link."}
 </p>
 </div>
 
 {!isSubmitted ? (
 <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
 <div>
 <label htmlFor="email" className="sr-only">Email address</label>
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
 Sending...
 </span>
) : (
 'Send Reset Link'
)}
 </button>
 </div>
 </form>
) : (
 <div className="mt-8 text-center space-y-4">
 <Link
 to="/reset-password"
 className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-surface-variant dark:hover:bg-gray-700 transition-all"
 >
 Proceed to Reset Password
 </Link>
 <p className="text-xs text-on-surface-variant">
 (If you have the token, you can proceed directly)
 </p>
 </div>
)}
 
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
