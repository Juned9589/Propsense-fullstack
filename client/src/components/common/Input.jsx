import React from 'react';

export default function Input({
 label,
 name,
 type = 'text',
 placeholder,
 error,
 register,
 icon: Icon,
 className = ''
}) {
 return (
 <div className={`w-full ${className}`}>
 {label && (
 <label htmlFor={name} className="block text-sm font-medium text-on-surface-variant mb-1.5">
 {label}
 </label>
)}
 <div className="relative">
 {Icon && (
 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
 <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
 </div>
)}
 <input
 id={name}
 type={type}
 placeholder={placeholder}
 className={`
 block w-full rounded-md border py-2.5 text-sm transition-colors
 focus:outline-none focus:ring-2 focus:ring-offset-0 text-on-surface dark:placeholder-gray-400
 ${Icon ? 'pl-10 pr-3' : 'px-3'}
 ${error 
 ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:ring-red-600' 
 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600'
 }
 `}
 {...(register ? register(name) : {})}
 />
 </div>
 {error && (
 <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
 {error.message || error}
 </p>
)}
 </div>
);
}
