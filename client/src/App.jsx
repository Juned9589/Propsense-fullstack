import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import Lenis from 'lenis';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Cursor from './components/common/Cursor';

// Route Guards
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages - Public
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const PropertyListing = lazy(() => import('./pages/property/PropertyListing'));
const PropertyDetail = lazy(() => import('./pages/property/PropertyDetail'));
const AgentProfile = lazy(() => import('./pages/user/AgentProfile'));

// Pages - Private
const MyDeals = lazy(() => import('./pages/deal/MyDeals'));
const DealDetail = lazy(() => import('./pages/deal/DealDetail'));
const AITools = lazy(() => import('./pages/ai/AITools'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Notifications = lazy(() => import('./pages/user/Notifications'));

// Pages - Agent Only
const CreateProperty = lazy(() => import('./pages/property/CreateProperty'));
const AgentDashboard = lazy(() => import('./pages/dashboard/AgentDashboard'));

// Pages - Admin Only
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/dashboard/UserManagement'));

const PageLoader = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-surface-variant border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-serif tracking-widest uppercase text-xs font-bold">Loading Experience...</p>
    </div>
);

function AnimatedRoutes() {
 const location = useLocation();

 return (
 <AnimatePresence mode="wait">
 <Suspense fallback={<PageLoader />}>
 <Routes location={location} key={location.pathname}>
 {/* Public Routes */}
 <Route path="/" element={<Landing />} />
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 <Route path="/forgot-password" element={<ForgotPassword />} />
 <Route path="/reset-password" element={<ResetPassword />} />
 <Route path="/reset-password/:token" element={<ResetPassword />} />
 <Route path="/properties" element={<PropertyListing />} />
 <Route path="/properties/:id" element={<PropertyDetail />} />
 <Route path="/agents/:id" element={<AgentProfile />} />

 {/* Private Routes (Any authenticated user) */}
 <Route element={<PrivateRoute />}>
 <Route path="/deals" element={<MyDeals />} />
 <Route path="/deals/:id" element={<DealDetail />} />
 <Route path="/ai" element={<AITools />} />
 <Route path="/profile" element={<Profile />} />
 <Route path="/notifications" element={<Notifications />} />
 </Route>

 {/* Agent Only Routes */}
 <Route element={<RoleRoute allowedRoles={['agent', 'admin']} />}>
 <Route path="/properties/create" element={<CreateProperty />} />
 <Route element={<DashboardLayout />}>
 <Route path="/dashboard/agent" element={<AgentDashboard />} />
 </Route>
 </Route>

 {/* Admin Only Routes */}
 <Route element={<RoleRoute allowedRoles={['admin']} />}>
 <Route element={<DashboardLayout />}>
 <Route path="/dashboard/admin" element={<AdminDashboard />} />
 <Route path="/dashboard/users" element={<UserManagement />} />
 </Route>
 </Route>

 {/* 404 Catch All */}
 <Route path="*" element={<div className="p-20 text-center text-2xl font-serif">404 - Page Not Found</div>} />
 </Routes>
 </Suspense>
 </AnimatePresence>
);
}

export default function App() {
 const dispatch = useDispatch();
 const { token, user } = useSelector((state) => state.auth);

 useEffect(() => {
 // Check for reduced motion preference
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (prefersReducedMotion.matches) return;

 // Initialize Lenis for smooth scrolling
 const lenis = new Lenis({
 duration: 1.2,
 easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
 orientation: 'vertical',
 gestureOrientation: 'vertical',
 smoothWheel: true,
 wheelMultiplier: 1,
 touchMultiplier: 2,
 });

 let rafId;
 function raf(time) {
 lenis.raf(time);
 rafId = requestAnimationFrame(raf);
 }

 rafId = requestAnimationFrame(raf);

 return () => {
 lenis.destroy();
 cancelAnimationFrame(rafId);
 };
 }, []);

 useEffect(() => {
 // Only fetch if token exists but user data is missing (e.g. on refresh)
 if (token && !user) {
 dispatch(getMe());
 }
 }, [dispatch, token, user]);

 return (
 <HelmetProvider>
 <Router>
 <div className="min-h-screen flex flex-col bg-surface text-on-surface transition-colors duration-200">
 <Cursor />
 <Navbar />
 <Toaster 
 position="top-right" 
 toastOptions={{
 style: {
 background: '#fbf9f9',
 color: '#1b1c1c',
 border: '1px solid #e4e2e2',
 fontFamily: 'Hanken Grotesk',
 borderRadius: '8px'
 }
 }}
 />
 <div className="flex-1">
 <AnimatedRoutes />
 </div>
 <Footer />
 </div>
 </Router>
 </HelmetProvider>
);
}
