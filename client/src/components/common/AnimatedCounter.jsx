import React, { useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value, prefix ="", suffix ="", duration = 1 }) {
 const motionValue = useMotionValue(0);
 const springValue = useSpring(motionValue, {
 damping: 30,
 stiffness: 100,
 duration: duration * 1000
 });
 
 useEffect(() => {
 motionValue.set(value);
 }, [value, motionValue]);

 const displayValue = useTransform(springValue, (current) => {
 return `${prefix}${Math.round(current).toLocaleString('en-IN')}${suffix}`;
 });

 return <motion.span>{displayValue}</motion.span>;
}
