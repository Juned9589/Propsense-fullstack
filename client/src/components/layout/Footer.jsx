import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
 return (
 <footer className="bg-surface border-t border-outline-variant/50 py-12 px-4 transition-colors duration-200">
 <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
 <div className="col-span-1 md:col-span-1">
 <Link to="/" className="flex items-center gap-2 mb-4">
 <Home className="h-6 w-6 text-primary" />
 <span className="text-xl font-bold tracking-tight text-on-surface">
 PropSense
 </span>
 </Link>
 <p className="text-sm text-on-surface-variant mb-6">
 The intelligent platform for finding, analyzing, and securing your dream property with AI.
 </p>
 <div className="flex gap-4">
 <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors"><Twitter size={20} /></a>
 <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Facebook size={20} /></a>
 <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
 <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors"><Linkedin size={20} /></a>
 </div>
 </div>
 
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Properties</h3>
 <ul className="space-y-3 text-sm text-on-surface-variant">
 <li><Link to="/properties" className="hover:text-primary dark:hover:text-blue-400">All Listings</Link></li>
 <li><Link to="/properties?type=apartment" className="hover:text-primary dark:hover:text-blue-400">Apartments</Link></li>
 <li><Link to="/properties?type=villa" className="hover:text-primary dark:hover:text-blue-400">Villas</Link></li>
 <li><Link to="/properties?type=commercial" className="hover:text-primary dark:hover:text-blue-400">Commercial</Link></li>
 </ul>
 </div>

 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Features</h3>
 <ul className="space-y-3 text-sm text-on-surface-variant">
 <li><Link to="/ai" className="hover:text-primary dark:hover:text-blue-400">AI Matcher</Link></li>
 <li><Link to="/ai" className="hover:text-primary dark:hover:text-blue-400">Smart Valuation</Link></li>
 <li><Link to="/deals" className="hover:text-primary dark:hover:text-blue-400">Deal Tracking</Link></li>
 <li><Link to="/profile" className="hover:text-primary dark:hover:text-blue-400">Preferences</Link></li>
 </ul>
 </div>

 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4">Company</h3>
 <ul className="space-y-3 text-sm text-on-surface-variant">
 <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400">About Us</Link></li>
 <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400">Contact</Link></li>
 <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400">Privacy Policy</Link></li>
 <li><Link to="#" className="hover:text-primary dark:hover:text-blue-400">Terms of Service</Link></li>
 </ul>
 </div>
 </div>
 <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/30 text-center text-sm text-gray-400">
 &copy; {new Date().getFullYear()} PropSense. All rights reserved.
 </div>
 </footer>
);
}
