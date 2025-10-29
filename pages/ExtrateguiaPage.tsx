import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Download, FileText, Calendar, ArrowRight, User, Sparkles } from 'lucide-react';
import { extrateguiaVolumes } from '../data/newsData';

export const ExtrateguiaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div 
        className="relative py-16 md:py-24 lg:py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)'
        }}
      >
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center text-white"
          >
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <BookOpen size={48} className="text-white" />
              </div>
            </div>
            
            {/* Title */}
            <h1 
              className="mb-6"
              style={{ 
                fontSize: 'clamp(40px, 8vw, 72px)', 
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: '1.1'
              }}
            >
              EXTRATEGIA
            </h1>
            
            {/* Subtitle */}
            <p 
              className="mb-8"
              style={{ 
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 600,
                opacity: 0.95,
                letterSpacing: '-0.01em'
              }}
            >
              Revista Académica de Pensamiento y Civilización
            </p>
            
            {/* Description */}
            <div 
              className="max-w-3xl mx-auto space-y-5"
              style={{ 
                fontSize: 'clamp(15px, 3vw, 17px)',
                lineHeight: '1.8',
                opacity: 0.92
              }}
            >
              <p>
                Un espacio de reflexión profunda donde las ideas se convierten en herramientas 
                para comprender, anticipar y transformar la realidad con estrategia.
              </p>
              <p>
                Desde una mirada <strong>occidental, republicana y liberal</strong>, EXTRATEGIA 
                reúne artículos y ensayos que defienden los principios que dieron forma a nuestra 
                civilización: la libertad individual, la razón, el mérito, el orden institucional 
                y la responsabilidad moral del ciudadano.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Mission Statement */}
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div 
            className="p-8 md:p-12 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 52, 138, 0.08) 0%, rgba(3, 63, 74, 0.08) 100%)',
              border: '2px solid rgba(124, 52, 138, 0.15)'
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <Sparkles 
                size={32} 
                style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} 
              />
              <div>
                <h2 
                  className="mb-4"
                  style={{ 
                    fontSize: 'clamp(22px, 5vw, 32px)', 
                    fontWeight: 800,
                    color: 'var(--color-brand-primary)',
                    lineHeight: '1.3'
                  }}
                >
                  Nuestra Misión
                </h2>
                <div 
                  className="text-gray-700 space-y-4"
                  style={{ fontSize: '16px', lineHeight: '1.8' }}
                >
                  <p>
                    Su propósito es contribuir al debate intelectual contemporáneo, promoviendo 
                    una cultura del pensamiento crítico y del estudio riguroso.
                  </p>
                  <p>
                    Cada texto publicado en EXTRATEGIA busca iluminar los desafíos del presente 
                    desde los valores que sostienen la libertad, el progreso y la dignidad humana.
                  </p>
                  <p>
                    Una publicación trimestral independiente dedicada al análisis profundo, ensayos 
                    de investigación y reflexiones sobre pensamiento político, economía, cultura y 
                    civilización occidental.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Volumes Section */}
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-12 md:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-12 text-center">
            <h2 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(28px, 6vw, 42px)', 
                fontWeight: 800,
                color: 'var(--color-brand-primary)'
              }}
            >
              Volúmenes Publicados
            </h2>
            <p className="text-gray-600" style={{ fontSize: '17px' }}>
              Explora nuestra colección de ediciones trimestrales
            </p>
          </div>

          <div className="space-y-16">
            {extrateguiaVolumes.map((volume, index) => (
              <motion.div
                key={volume.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.4 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                  {/* Cover Image */}
                  <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-auto overflow-hidden">
                    <img
                      src={volume.coverImageUrl}
                      alt={volume.title}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'
                      }}
                    />
                    <div className="absolute bottom-8 left-8 right-8">
                      <span 
                        className="inline-block px-4 py-1.5 rounded-full mb-3"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.05em'
                        }}
                      >
                        {volume.title}
                      </span>
                      <h3 
                        className="text-white"
                        style={{ 
                          fontSize: 'clamp(22px, 4vw, 32px)', 
                          fontWeight: 800,
                          lineHeight: '1.2'
                        }}
                      >
                        {volume.editorialTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-3 p-8 md:p-10 lg:p-12">
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span style={{ fontWeight: 600 }}>
                          {new Date(volume.publishDate).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span style={{ fontWeight: 600 }}>{volume.pageCount} páginas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={18} />
                        <span style={{ fontWeight: 600 }}>{volume.articles.length} artículos</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p 
                      className="mb-8 text-gray-700"
                      style={{ fontSize: '16px', lineHeight: '1.8' }}
                    >
                      {volume.description}
                    </p>

                    {/* Editorial Preview */}
                    <div 
                      className="mb-8 p-6 rounded-xl bg-gray-50"
                    >
                      <h4 
                        className="mb-3"
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: 800, 
                          color: 'var(--color-brand-primary)',
                          letterSpacing: '0.05em'
                        }}
                      >
                        EDITORIAL
                      </h4>
                      <p 
                        className="text-gray-700"
                        style={{ fontSize: '14px', lineHeight: '1.7' }}
                      >
                        {volume.editorial.split('\n\n')[0]}...
                      </p>
                    </div>

                    {/* Articles List */}
                    <div className="mb-8">
                      <h4 
                        className="mb-4"
                        style={{ 
                          fontSize: '15px', 
                          fontWeight: 800, 
                          color: 'var(--color-brand-primary)',
                          letterSpacing: '0.05em'
                        }}
                      >
                        CONTENIDO
                      </h4>
                      <div className="space-y-3">
                        {volume.articles.map((article) => (
                          <Link
                            key={article.id}
                            to={`/extrategia/${volume.id}/${article.id}`}
                            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-teal-50 transition-all duration-200 group"
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                              style={{ 
                                backgroundColor: 'var(--color-brand-primary)',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: 700
                              }}
                            >
                              {article.pageStart}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 
                                className="mb-1 group-hover:text-[var(--color-brand-primary)] transition-colors"
                                style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.4' }}
                              >
                                {article.title}
                              </h5>
                              <p className="text-gray-600 text-sm mb-2">
                                {article.author}
                              </p>
                              <p className="text-gray-500 text-xs line-clamp-2">
                                {article.abstract}
                              </p>
                            </div>
                            <ArrowRight 
                              size={20} 
                              className="flex-shrink-0 text-gray-400 group-hover:text-[var(--color-brand-primary)] group-hover:translate-x-1 transition-all" 
                            />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Download Button */}
                    <a
                      href={volume.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 700
                      }}
                    >
                      <Download size={22} />
                      Descargar Volumen Completo (PDF)
                    </a>

                    <p className="mt-3 text-center text-xs text-gray-500">
                      Acceso gratuito • {(volume.pageCount * 0.2).toFixed(1)} MB aproximadamente
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action - Contribute */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20"
        >
          <div 
            className="max-w-4xl mx-auto p-10 md:p-16 rounded-3xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 52, 138, 0.05) 0%, rgba(3, 63, 74, 0.05) 100%)',
              border: '3px solid rgba(124, 52, 138, 0.15)'
            }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-white" />
            </div>
            
            <h3 
              className="mb-4"
              style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800 }}
            >
              ¿Deseas contribuir a EXTRATEGIA?
            </h3>
            
            <p 
              className="mb-8 text-gray-600 max-w-2xl mx-auto"
              style={{ fontSize: '17px', lineHeight: '1.8' }}
            >
              Invitamos a académicos, investigadores y pensadores comprometidos con los valores 
              de la civilización occidental a enviar sus propuestas de artículos para futuras 
              ediciones. EXTRATEGIA es un espacio abierto al debate riguroso y la reflexión profunda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:extrategia@pdp.com"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700
                }}
              >
                Contactar al Comité Editorial
                <ArrowRight size={20} />
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Revisión por pares • Publicación trimestral • Acceso abierto
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
