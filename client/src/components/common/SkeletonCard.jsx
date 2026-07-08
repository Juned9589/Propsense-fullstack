import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonCard() {
 return (
 <div className="rounded-2xl overflow-hidden shadow-lg bg-surface border border-outline-variant/30">
 <Skeleton height={256} className="bg-surface-variant rounded-none" />
 <div className="p-6">
 <Skeleton width="80%" height={28} className="mb-3 bg-surface-variant" />
 <Skeleton width="40%" height={28} className="mb-5 bg-surface-variant" />
 <Skeleton width="60%" height={16} className="mb-5 bg-surface-variant" />
 <div className="flex gap-5 border-t border-outline-variant/30 pt-5">
 <Skeleton width={30} height={20} className="bg-surface-variant" />
 <Skeleton width={30} height={20} className="bg-surface-variant" />
 <Skeleton width={60} height={20} className="bg-surface-variant" />
 </div>
 </div>
 </div>
);
}
