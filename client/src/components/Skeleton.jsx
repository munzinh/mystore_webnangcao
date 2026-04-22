import React from 'react';

export const SkeletonBase = ({ className = "" }) => (
    <div className={`skeleton ${className}`}></div>
);

export const SkeletonProductCard = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 animate-pulse">
            {/* Image Placeholder */}
            <div className="skeleton h-32 md:h-48 w-full rounded-lg mb-3"></div>
            
            {/* Title Placeholder */}
            <div className="skeleton h-4 w-3/4 mb-2 rounded"></div>
            <div className="skeleton h-4 w-1/2 mb-4 rounded"></div>
            
            {/* Price Placeholder */}
            <div className="flex justify-between items-center">
                <div className="skeleton h-6 w-1/3 rounded"></div>
                <div className="skeleton h-8 w-1/4 rounded-full"></div>
            </div>
        </div>
    );
};

export const SkeletonProductDetails = () => {
    return (
        <div className="mt-12 px-4 sm:px-6 lg:px-8 animate-pulse">
            <div className="max-w-screen-xl mx-auto">
                {/* Breadcrumb skeleton */}
                <div className="skeleton h-4 w-1/3 mb-6 rounded"></div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Gallery skeleton */}
                    <div className="flex gap-3 shrink-0">
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton w-16 h-16 md:w-20 md:h-20 rounded"></div>
                            ))}
                        </div>
                        <div className="skeleton w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-lg"></div>
                    </div>

                    {/* Info skeleton */}
                    <div className="flex-1 space-y-6">
                        <div className="skeleton h-10 w-3/4 rounded"></div>
                        <div className="skeleton h-4 w-1/4 rounded"></div>
                        
                        <div className="space-y-3">
                            <div className="skeleton h-12 w-full rounded"></div>
                            <div className="skeleton h-12 w-full rounded"></div>
                        </div>

                        <div className="space-y-2">
                            <div className="skeleton h-4 w-full rounded"></div>
                            <div className="skeleton h-4 w-full rounded"></div>
                            <div className="skeleton h-4 w-2/3 rounded"></div>
                        </div>

                        <div className="flex gap-4 pt-10">
                            <div className="skeleton h-14 flex-1 rounded"></div>
                            <div className="skeleton h-14 flex-1 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
