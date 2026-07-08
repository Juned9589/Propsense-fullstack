import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ 
 isOpen, 
 onClose, 
 title, 
 children, 
 size = 'md' 
}) {
 // Prevent background scrolling when modal is open
 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 };
 }, [isOpen]);

 const sizes = {
 sm: 'max-w-md',
 md: 'max-w-lg',
 lg: 'max-w-2xl',
 xl: 'max-w-4xl'
 };

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 onClick={onClose}
 className="fixed inset-0 bg-black/60 backdrop-blur-sm"
 aria-hidden="true"
 />

 {/* Modal Panel */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type:"spring", duration: 0.4, bounce: 0.2 }}
 className={`relative w-full ${sizes[size]} rounded-2xl bg-white shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh]`}
 role="dialog"
 aria-modal="true"
 >
 {/* Header */}
 {title && (
 <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
 <h3 className="text-lg font-semibold text-on-surface">
 {title}
 </h3>
 <button
 onClick={onClose}
 className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-surface-variant dark:hover:text-gray-300 transition-colors"
 >
 <span className="sr-only">Close</span>
 <X className="h-5 w-5" aria-hidden="true" />
 </button>
 </div>
)}

 {/* Content */}
 <div className="px-6 py-4 overflow-y-auto flex-1">
 {children}
 </div>
 </motion.div>
 </div>
)}
 </AnimatePresence>
);
}
