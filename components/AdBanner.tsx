import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export interface AdBannerProps {
    position: "hero" | "sidebar" | "in-article";
    className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, className = "" }) => {
    const ads = useQuery(api.ads.getActiveByPosition, { position });
    const recordImpression = useMutation(api.ads.recordImpression);
    const recordClick = useMutation(api.ads.recordClick);
    const [impressionRecorded, setImpressionRecorded] = useState(false);

    // Pick a random active ad for the given position
    const activeAd = ads && ads.length > 0
        ? ads[Math.floor(Math.random() * ads.length)]
        : null;

    useEffect(() => {
        if (activeAd && !impressionRecorded) {
            recordImpression({ id: activeAd._id }).catch(console.error);
            setImpressionRecorded(true);
        }
    }, [activeAd, impressionRecorded, recordImpression]);

    if (ads === undefined) {
        // Loading state, maybe return null or a skeleton
        return null;
    }

    if (!activeAd) {
        return null; // No active ads for this position
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        recordClick({ id: activeAd._id }).catch(console.error);
        window.open(activeAd.targetUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`ad-container relative mx-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors ${className}`}>
            <span className="absolute top-0 right-0 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-bl-md z-10">
                Publicidad
            </span>
            <a href={activeAd.targetUrl} onClick={handleClick} className="w-full h-full block group">
                <img
                    src={activeAd.imageUrl}
                    alt={activeAd.title || 'Advertisement'}
                    loading={position === 'hero' ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </a>
        </div>
    );
};
