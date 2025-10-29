import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div 
          className="mb-8"
          style={{ 
            fontSize: 'clamp(80px, 15vw, 160px)',
            fontWeight: 800,
            color: 'var(--color-brand-primary)',
            lineHeight: 1
          }}
        >
          404
        </div>
        
        <h1 
          className="mb-4"
          style={{ 
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 700
          }}
        >
          Página no encontrada
        </h1>
        
        <p 
          className="text-gray-600 mb-12 max-w-md mx-auto"
          style={{ fontSize: '18px', lineHeight: '1.6' }}
        >
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg transition-all hover:scale-105 shadow-lg"
            style={{ 
              backgroundColor: 'var(--color-brand-primary)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            <Home size={20} />
            Volver al inicio
          </Link>
          
          <Link
            to="/buscar"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 transition-all hover:scale-105"
            style={{ 
              borderColor: 'var(--color-brand-primary)',
              color: 'var(--color-brand-primary)',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            <Search size={20} />
            Buscar noticias
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 flex items-center justify-center gap-2 opacity-30">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-brand-secondary)' }}
          />
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-brand-neutral-500)' }}
          />
        </div>
      </div>
    </div>
  );
};
