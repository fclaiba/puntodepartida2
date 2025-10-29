import React from 'react';

export type SectionType = 'politica' | 'economia' | 'internacional' | 'local' | 'opinion' | 'extrategia';

interface SectionTagProps {
  section: SectionType;
  variant?: 'light' | 'dark';
  className?: string;
}

const sectionConfig: Record<SectionType, { label: string; color: string }> = {
  politica: { label: 'POLÍTICA', color: 'var(--color-tag-politica)' },
  economia: { label: 'ECONOMÍA', color: 'var(--color-tag-economia)' },
  internacional: { label: 'INTERNACIONAL', color: 'var(--color-tag-internacional)' },
  local: { label: 'LOCAL', color: 'var(--color-tag-local)' },
  opinion: { label: 'OPINIÓN', color: 'var(--color-tag-opinion)' },
  extrategia: { label: 'EXTRATEGIA', color: 'var(--color-tag-extrategia)' },
};

export const SectionTag: React.FC<SectionTagProps> = ({ 
  section, 
  variant = 'dark',
  className = '' 
}) => {
  const config = sectionConfig[section];
  const bgColor = variant === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.95)';
  const textColor = variant === 'dark' ? '#ffffff' : '#000000';

  return (
    <div 
      className={`inline-flex items-center gap-1.5 md:gap-2 rounded-md overflow-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="w-1.5 md:w-2 h-full"
        style={{ backgroundColor: config.color }}
      />
      <span 
        className="px-2 md:px-3 py-1.5 md:py-2 tracking-wider"
        style={{ 
          color: textColor,
          fontSize: 'clamp(10px, 2vw, 12px)',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}
      >
        {config.label}
      </span>
    </div>
  );
};
