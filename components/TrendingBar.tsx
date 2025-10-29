import React from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface TrendingBarProps {
  topics: string[];
}

export const TrendingBar: React.FC<TrendingBarProps> = ({ topics }) => {
  return (
    <div 
      className="py-2 md:py-3 border-y border-gray-200 overflow-hidden"
      style={{ backgroundColor: '#f9f9f9' }}
    >
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px]">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <TrendingUp size={16} className="md:hidden" style={{ color: 'var(--color-brand-primary)' }} />
            <TrendingUp size={18} className="hidden md:block" style={{ color: 'var(--color-brand-primary)' }} />
            <span 
              className="hidden sm:inline"
              style={{ 
                fontSize: 'clamp(11px, 2vw, 13px)', 
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                letterSpacing: '0.05em'
              }}
            >
              TENDENCIAS
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...topics, ...topics].map((topic, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex-shrink-0 hover:text-[var(--color-brand-primary)] transition-colors"
                  style={{ fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: 500 }}
                >
                  {topic}
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
