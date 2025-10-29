import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SectionType } from './SectionTag';

interface SectionHeaderProps {
  title: string;
  section?: SectionType;
  link?: string;
  showLink?: boolean;
}

const sectionColors: Record<SectionType, string> = {
  politica: 'var(--color-tag-politica)',
  economia: 'var(--color-tag-economia)',
  internacional: 'var(--color-tag-internacional)',
  local: 'var(--color-tag-local)',
  opinion: 'var(--color-tag-opinion)',
  extrategia: 'var(--color-tag-extrategia)',
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, section, link, showLink = true }) => {
  const accentColor = section ? sectionColors[section] : 'var(--color-brand-primary)';

  return (
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <div className="flex items-center gap-2 md:gap-3">
        {section && (
          <div 
            className="w-1 h-6 md:h-8 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        )}
        <h2 
          className="tracking-tight"
          style={{ 
            fontSize: 'clamp(20px, 4vw, 32px)',
            fontWeight: 700,
            color: section ? accentColor : 'var(--color-brand-primary)'
          }}
        >
          {title}
        </h2>
      </div>
      
      {link && showLink && (
        <a 
          href={link}
          className="flex items-center gap-1 group hover:gap-2 transition-all flex-shrink-0"
          style={{ 
            fontSize: 'clamp(12px, 2vw, 14px)',
            fontWeight: 500,
            color: 'var(--color-brand-primary)'
          }}
        >
          <span className="hidden sm:inline">Ver más</span>
          <span className="sm:hidden">Más</span>
          <ChevronRight size={14} className="md:hidden transition-transform group-hover:translate-x-0.5" />
          <ChevronRight size={16} className="hidden md:block transition-transform group-hover:translate-x-0.5" />
        </a>
      )}
    </div>
  );
};
