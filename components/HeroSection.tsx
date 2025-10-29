import React from 'react';
import { SectionTag, SectionType } from './SectionTag';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface HeroSectionProps {
  title: string;
  section: SectionType;
  imageUrl: string;
  description?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  section,
  imageUrl,
  description
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full aspect-[16/11] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden group cursor-pointer"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.1) 80%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 lg:p-12">
        <div className="max-w-4xl">
          <SectionTag section={section} variant="dark" className="mb-3 md:mb-4" />
          
          <h1 
            className="text-white mb-2 md:mb-3 leading-tight"
            style={{ 
              fontSize: 'clamp(24px, 6vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: '1.1',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {title}
          </h1>
          
          {description && (
            <p 
              className="text-white/95 max-w-2xl hidden sm:block"
              style={{ 
                fontSize: 'clamp(15px, 2vw, 18px)',
                fontWeight: 400,
                lineHeight: '1.5',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)'
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* PDP Logo Watermark */}
        <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 lg:bottom-12 lg:right-12">
          <div 
            className="opacity-70 md:opacity-80"
            style={{ 
              fontSize: 'clamp(24px, 5vw, 32px)', 
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.05em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            PDP
          </div>
        </div>
      </div>
    </motion.div>
  );
};
