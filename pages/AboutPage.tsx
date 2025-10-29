import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Users, Target, Globe } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-4 md:py-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--color-brand-primary)] transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>

      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] pb-12 md:pb-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <h1 
            className="mb-6"
            style={{ 
              fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 800,
              color: 'var(--color-brand-primary)',
              lineHeight: '1.2'
            }}
          >
            Sobre PDP Diario Digital
          </h1>
          <p 
            className="text-gray-700 max-w-2xl mx-auto"
            style={{ fontSize: '20px', lineHeight: '1.6' }}
          >
            Tu fuente confiable de información verificada y análisis profundo de los acontecimientos que importan.
          </p>
        </div>

        {/* Mission */}
        <div 
          className="max-w-5xl mx-auto p-6 md:p-10 lg:p-12 rounded-xl md:rounded-2xl mb-12 md:mb-16"
          style={{ 
            background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-neutral-500) 100%)'
          }}
        >
          <h2 
            className="text-white mb-4 md:mb-6 text-center"
            style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700 }}
          >
            Nuestra Misión
          </h2>
          <p 
            className="text-white/90 text-center max-w-3xl mx-auto"
            style={{ fontSize: 'clamp(16px, 3vw, 18px)', lineHeight: '1.8' }}
          >
            Informar con precisión, profundidad y transparencia. Nos comprometemos a entregar noticias verificadas, 
            análisis imparciales y reportajes de calidad que contribuyan al debate público informado.
          </p>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto mb-12 md:mb-16">
          <h2 
            className="text-center mb-8 md:mb-12"
            style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: 'var(--color-brand-primary)' }}
          >
            Nuestros Valores
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                icon: Award,
                title: 'Excelencia',
                description: 'Compromiso con la calidad periodística y el rigor informativo'
              },
              {
                icon: Users,
                title: 'Comunidad',
                description: 'Servicio a nuestros lectores y a la sociedad en general'
              },
              {
                icon: Target,
                title: 'Precisión',
                description: 'Verificación de hechos y fuentes confiables en cada nota'
              },
              {
                icon: Globe,
                title: 'Alcance Global',
                description: 'Perspectiva internacional con enfoque local'
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="p-5 md:p-6 rounded-lg md:rounded-xl text-center"
                style={{ backgroundColor: '#f9f9f9' }}
              >
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                >
                  <value.icon size={24} className="text-white md:hidden" />
                  <value.icon size={32} className="text-white hidden md:block" />
                </div>
                <h3 
                  className="mb-2 md:mb-3"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600 }}
                >
                  {value.title}
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: '1.6' }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="mb-4 md:mb-6"
            style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: 'var(--color-brand-primary)' }}
          >
            Nuestro Equipo
          </h2>
          <p 
            className="text-gray-700 mb-8 md:mb-12"
            style={{ fontSize: 'clamp(16px, 3vw, 18px)', lineHeight: '1.6' }}
          >
            Contamos con un equipo multidisciplinario de periodistas especializados, editores experimentados 
            y analistas expertos comprometidos con la verdad y la excelencia informativa.
          </p>
          
          <div 
            className="p-5 md:p-8 rounded-lg md:rounded-xl"
            style={{ backgroundColor: '#f9f9f9' }}
          >
            <p 
              className="text-gray-800 mb-4 md:mb-6"
              style={{ fontSize: 'clamp(14px, 3vw, 16px)', lineHeight: '1.8' }}
            >
              "El periodismo de calidad es fundamental para una sociedad democrática e informada. 
              En PDP Diario Digital trabajamos cada día para mantener ese estándar de excelencia."
            </p>
            <div 
              style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-primary)' }}
            >
              Equipo Editorial PDP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
