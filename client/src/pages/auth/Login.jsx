import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginUser } from '../../features/auth/authSlice';
import { Mail, Lock } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

export default function Login() {
 const { register, handleSubmit, formState: { errors } } = useForm();
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const { user, loading } = useSelector((state) => state.auth);

 // Redirect if already logged in
 React.useEffect(() => {
 if (user) {
 if (user.role === 'admin') navigate('/dashboard/admin');
 else if (user.role === 'agent') navigate('/dashboard/agent');
 else navigate('/');
 }
 }, [user, navigate]);

 const onSubmit = async (data) => {
 try {
 const resultAction = await dispatch(loginUser(data));
 
 if (loginUser.fulfilled.match(resultAction)) {
 toast.success('Login successful!');
 
 // Determine redirection based on role
 const user = resultAction.payload.user;
 if (user?.role === 'agent') {
 navigate('/dashboard/agent');
 } else if (user?.role === 'admin') {
 navigate('/dashboard/admin');
 } else {
 navigate('/'); // Default for buyer
 }
 } else {
 toast.error(resultAction.payload || 'Login failed. Please check your credentials.');
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
 Welcome back
 </h2>
 <p className="mt-2 text-center text-sm text-on-surface-variant">
 Sign in to your PropSense account
 </p>
 </div>
 
 <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
 <div className="space-y-4">
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

 {/* Password Field */}
 <div>
 <div className="relative">
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
 <input
 id="password"
 type="password"
 autoComplete="current-password"
 className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-on-surface dark:placeholder-gray-400"
 placeholder="Password"
 {...register('password', { required: 'Password is required' })}
 />
 </div>
 {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
 </div>
 </div>

 <div className="flex items-center justify-between">
 <div className="text-sm">
 <Link to="/forgot-password" className="font-medium text-primary hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
 Forgot your password?
 </Link>
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
 Signing in...
 </span>
) : (
 'Sign in'
)}
 </button>
 </div>
 </form>
 
 <div className="mt-6 text-center text-sm text-on-surface-variant">
 Don't have an account?{' '}
 <Link to="/register" className="font-semibold text-primary hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
 Sign up
 </Link>
 </div>
 </div>
 </PageTransition>
);
}
