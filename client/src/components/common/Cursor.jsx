import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Cursor() {
 const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
 const [isHovering, setIsHovering] = useState(false);

 useEffect(() => {
 const updateMousePosition = (e) => {
 setMousePosition({ x: e.clientX, y: e.clientY });
 };

 const handleMouseOver = (e) => {
 if (e.target.closest('button, a, input, select, .interactive')) {
 setIsHovering(true);
 } else {
 setIsHovering(false);
 }
 };

 window.addEventListener('mousemove', updateMousePosition);
 window.addEventListener('mouseover', handleMouseOver);

 return () => {
 window.removeEventListener('mousemove', updateMousePosition);
 window.removeEventListener('mouseover', handleMouseOver);
 };
 }, []);

 return (
 <>
 <motion.div
 className="fixed top-0 left-0 w-4 h-4 bg-primary-500 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
 animate={{
 x: mousePosition.x - 8,
 y: mousePosition.y - 8,
 scale: isHovering ? 3 : 1,
 opacity: isHovering ? 0.5 : 1
 }}
 transition={{ type: 'tween', ease: 'backOut', duration: 0.15 }}
 />
 <motion.div
 className="fixed top-0 left-0 w-8 h-8 border border-primary-500 rounded-full pointer-events-none z-[9998] hidden md:block"
 animate={{
 x: mousePosition.x - 16,
 y: mousePosition.y - 16,
 scale: isHovering ? 1.5 : 1,
 opacity: isHovering ? 0 : 0.5
 }}
 transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
 />
 </>
);
}
