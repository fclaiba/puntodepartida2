import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  alert?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color = 'var(--color-brand-primary)',
  alert = false
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow ${
        alert ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: trendUp ? '#dcfce7' : '#fee2e2',
              color: trendUp ? '#16a34a' : '#dc2626',
              fontWeight: 600
            }}
          >
            {trend}
          </span>
        )}
      </div>
      
      <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
        {value}
      </div>
      
      <div className="text-gray-600" style={{ fontSize: '14px' }}>
        {label}
      </div>
    </motion.div>
  );
};
