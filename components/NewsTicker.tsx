
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const NewsTicker: React.FC = () => {
    // 1. Fetch latest articles (limited to 5)
    // We use the existing getPublic query.
    // Ideally we would want a specific "getLatest" or just use limit=5
    const latestArticles = useQuery(api.articles.getPublic, { limit: 5 });

    // 2. Loading state (optional, or just return null to avoid layout shift if preferred)
    if (!latestArticles || latestArticles.length === 0) {
        return null;
    }

    // 3. Duplicate items to ensure smooth infinite loop if there are few items
    const tickerItems = [...latestArticles, ...latestArticles, ...latestArticles];

    return (
        <div className="bg-[var(--color-brand-primary)] text-white overflow-hidden py-2 relative z-50">
            <div className="container mx-auto px-4 flex items-center">
                <div className="bg-[var(--color-brand-secondary)] text-[10px] md:text-xs font-bold px-2 py-1 rounded mr-3 whitespace-nowrap z-10 hidden sm:block">
                    ÚLTIMO MOMENTO
                </div>

                <div className="flex-1 overflow-hidden relative mask-linear-gradient">
                    {/* The scrolling container */}
                    <motion.div
                        className="flex whitespace-nowrap gap-8"
                        animate={{ x: [0, -1000] }} // Basic movement, will need adjustment based on content width
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 30, // Adjust speed
                                ease: "linear",
                            },
                        }}
                        style={{ width: 'max-content' }}
                    >
                        {tickerItems.map((article, index) => {
                            if (!article) return null;
                            return (
                                <Link
                                    key={`${article._id}-${index}`}
                                    to={`/noticias/${article.section}/${article._id}`}
                                    className="text-xs md:text-sm font-medium hover:underline flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-secondary)] inline-block" />
                                    {article.title}
                                </Link>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
