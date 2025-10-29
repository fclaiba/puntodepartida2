import React from 'react';
import { SectionTag, SectionType } from './SectionTag';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface NewsCardProps {
  title: string;
  section: SectionType;
  imageUrl: string;
  description?: string;
  variant?: 'standard' | 'featured' | 'horizontal' | 'compact';
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  section,
  imageUrl,
  description,
  variant = 'standard',
  className = ''
}) => {
  if (variant === 'horizontal') {
    return (
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={`group cursor-pointer ${className}`}
      >
        <div className="flex gap-3 md:gap-4 bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
          <div className="relative w-28 sm:w-32 md:w-40 flex-shrink-0">
            <ImageWithFallback
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
            <div>
              <SectionTag section={section} variant="light" className="mb-2" />
              <h3 
                className="line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors"
                style={{ 
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}
              >
                {title}
              </h3>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={`group cursor-pointer ${className}`}
      >
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
          <div className="relative aspect-[4/3] overflow-hidden">
            <ImageWithFallback
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 70%)'
              }}
            />
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <SectionTag section={section} variant="dark" />
            </div>
          </div>
          <div className="p-3 md:p-4">
            <h3 
              className="line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors"
              style={{ 
                fontSize: 'clamp(13px, 2.5vw, 14px)',
                fontWeight: 600,
                lineHeight: '1.4'
              }}
            >
              {title}
            </h3>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className={`group cursor-pointer ${className}`}
      >
        <div className="relative overflow-hidden rounded-lg md:rounded-xl">
          <div className="relative aspect-[16/10] sm:aspect-[4/5]">
            <ImageWithFallback
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.2) 70%, transparent 100%)'
              }}
            />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
            <SectionTag section={section} variant="dark" className="mb-2 md:mb-3" />
            <h2 
              className="text-white mb-1 md:mb-2 line-clamp-3"
              style={{ 
                fontSize: 'clamp(18px, 4vw, 32px)',
                fontWeight: 700,
                lineHeight: '1.2',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {title}
            </h2>
            {description && (
              <p 
                className="text-white/95 line-clamp-2 hidden sm:block"
                style={{ 
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontWeight: 400,
                  lineHeight: '1.5',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  // Standard variant
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group cursor-pointer ${className}`}
    >
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 70%)'
            }}
          />
          <div className="absolute top-3 left-3 md:top-4 md:left-4">
            <SectionTag section={section} variant="dark" />
          </div>
        </div>
        
        <div className="p-4 md:p-5">
          <h3 
            className="mb-2 line-clamp-2 group-hover:text-[var(--color-brand-primary)] transition-colors"
            style={{ 
              fontSize: 'clamp(16px, 3vw, 18px)',
              fontWeight: 600,
              lineHeight: '1.4'
            }}
          >
            {title}
          </h3>
          {description && (
            <p 
              className="text-gray-600 line-clamp-2 hidden sm:block"
              style={{ 
                fontSize: 'clamp(13px, 2vw, 14px)',
                lineHeight: '1.5'
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
};
