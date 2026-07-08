import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Button({ 
 children, 
 variant = 'primary', 
 size = 'md', 
 loading = false, 
 disabled = false, 
 onClick, 
 icon: Icon,
 type = 'button',
 className = ''
}) {
 const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed';
 
 const variants = {
 primary: 'bg-primary text-on-primary text-white hover:bg-primary-container hover:text-on-primary-container focus:ring-blue-500',
 secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-surface-variant dark:hover:bg-gray-700',
 ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:hover:bg-surface-variant',
 danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
 };

 const sizes = {
 sm: 'px-3 py-1.5 text-sm',
 md: 'px-4 py-2.5 text-sm',
 lg: 'px-6 py-3 text-base'
 };

 return (
 <motion.button
 type={type}
 onClick={onClick}
 disabled={disabled || loading}
 whileTap={(!disabled && !loading) ? { scale: 0.97 } : {}}
 className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
 >
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {!loading && Icon && <Icon className={`mr-2 ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />}
 {children}
 </motion.button>
);
}
