import React from 'react';
import { Check } from 'lucide-react';

export type StoryTemplate = 'gradient' | 'minimal' | 'bold' | 'classic';

interface StoryTemplateSelectorProps {
  selected: StoryTemplate;
  onSelect: (template: StoryTemplate) => void;
}

const templates: Array<{
  id: StoryTemplate;
  name: string;
  description: string;
  gradient: string;
}> = [
  {
    id: 'gradient',
    name: 'Gradiente',
    description: 'Diseño moderno con gradiente',
    gradient: 'linear-gradient(135deg, #7c348a 0%, #936a94 100%)'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Diseño limpio y elegante',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
  },
  {
    id: 'bold',
    name: 'Atrevido',
    description: 'Colores vibrantes y llamativos',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)'
  },
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Elegante y profesional',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
  }
];

export const StoryTemplateSelector: React.FC<StoryTemplateSelectorProps> = ({
  selected,
  onSelect
}) => {
  return (
    <div className="mb-6">
      <label 
        className="block mb-3"
        style={{ fontSize: '14px', fontWeight: 600 }}
      >
        Selecciona un estilo
      </label>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selected === template.id ? 'border-[#7c348a]' : 'border-gray-200'
            }`}
          >
            {/* Preview */}
            <div 
              className="w-full h-16 rounded-lg mb-3"
              style={{ background: template.gradient }}
            />
            
            {/* Name and description */}
            <div>
              <div 
                className="flex items-center justify-between mb-1"
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  {template.name}
                </span>
                {selected === template.id && (
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#7c348a' }}
                  >
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
              <p 
                className="text-gray-600"
                style={{ fontSize: '12px' }}
              >
                {template.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const getTemplateStyles = (template: StoryTemplate) => {
  switch (template) {
    case 'gradient':
      return {
        overlayGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%)',
        badgeBackground: '#7c348a',
        textColor: '#ffffff',
        accentColor: '#7c348a'
      };
    case 'minimal':
      return {
        overlayGradient: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.75) 100%)',
        badgeBackground: '#1f2937',
        textColor: '#1f2937',
        accentColor: '#7c348a'
      };
    case 'bold':
      return {
        overlayGradient: 'linear-gradient(to bottom, rgba(220,38,38,0.9) 0%, transparent 30%, transparent 70%, rgba(124,45,18,0.9) 100%)',
        badgeBackground: '#dc2626',
        textColor: '#ffffff',
        accentColor: '#fca5a5'
      };
    case 'classic':
      return {
        overlayGradient: 'linear-gradient(to bottom, rgba(31,41,55,0.95) 0%, transparent 30%, transparent 70%, rgba(17,24,39,0.95) 100%)',
        badgeBackground: '#7c348a',
        textColor: '#ffffff',
        accentColor: '#c084fc'
      };
  }
};
