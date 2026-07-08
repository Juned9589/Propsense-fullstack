import React from 'react';
import { User } from 'lucide-react';

export default function Avatar({ src, name, size = 'md', className = '' }) {
 const sizes = {
 sm: 'h-8 w-8 text-xs',
 md: 'h-10 w-10 text-sm',
 lg: 'h-14 w-14 text-base'
 };

 const getInitials = (name) => {
 if (!name) return '';
 const parts = name.split(' ');
 if (parts.length >= 2) {
 return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
 }
 return name.substring(0, 2).toUpperCase();
 };

 return (
 <div 
 className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-variant ${sizes[size]} ${className}`}
 title={name}
 >
 {src ? (
 <img loading="lazy" decoding="async" 
 src={src} 
 alt={name || 'Avatar'} 
 className="h-full w-full object-cover"
 />
) : name ? (
 <span className="font-medium text-on-surface-variant">
 {getInitials(name)}
 </span>
) : (
 <User className="h-1/2 w-1/2 text-gray-400" />
)}
 </div>
);
}
