import React from 'react';
import { SectionType } from '../data/types';
export type { SectionType };

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
  const config = sectionConfig[section] || { label: section?.toUpperCase() || 'NOTICIA', color: '#666' };
  const bgColor = variant === 'dark' ? config.color : 'rgba(255, 255, 255, 0.95)';
  const textColor = variant === 'dark' ? '#ffffff' : config.color;

  return (
    <div
      className={`inline-flex items-center rounded-md overflow-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        backdropFilter: variant === 'dark' ? 'none' : 'blur(8px)',
        border: variant === 'light' ? `1px solid ${config.color}30` : 'none',
        boxShadow: variant === 'dark' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      {variant === 'light' && (
        <div
          className="w-1.5 md:w-2 h-full"
          style={{ backgroundColor: config.color }}
        />
      )}
      <span
        className="px-2.5 md:px-3 py-1 md:py-1.5 tracking-wider"
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
