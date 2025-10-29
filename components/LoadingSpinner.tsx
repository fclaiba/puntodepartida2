import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        className="w-12 h-12 rounded-full border-4 border-gray-200"
        style={{ 
          borderTopColor: 'var(--color-brand-primary)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-gray-200 mx-auto mb-6"
          style={{ 
            borderTopColor: 'var(--color-brand-primary)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div 
          style={{ 
            fontSize: '24px', 
            fontWeight: 700,
            color: 'var(--color-brand-primary)'
          }}
        >
          PDP
        </div>
        <p className="text-gray-600 mt-2" style={{ fontSize: '14px' }}>
          Cargando...
        </p>
      </div>
    </div>
  );
};
