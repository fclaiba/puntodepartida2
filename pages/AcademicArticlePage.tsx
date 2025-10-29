import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Calendar, FileText, Download, User, Tag } from 'lucide-react';
import { extrateguiaVolumes } from '../data/newsData';

export const AcademicArticlePage: React.FC = () => {
  const { volumeId, articleId } = useParams<{ volumeId: string; articleId: string }>();

  // Find the volume and article
  const volume = extrateguiaVolumes.find(v => v.id === volumeId);
  const article = volume?.articles.find(a => a.id === articleId);

  if (!volume || !article) {
    return <Navigate to="/extrategia" replace />;
  }

  // Format content sections
  const contentSections = article.content.split('\n## ').slice(1);
  const introduction = article.content.split('\n## ')[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb & Back Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/extrategia" className="hover:text-[var(--color-brand-primary)] transition-colors">
              EXTRATEGIA
            </Link>
            <span>/</span>
            <Link 
              to="/extrategia" 
              className="hover:text-[var(--color-brand-primary)] transition-colors"
            >
              {volume.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </div>
          <Link
            to="/extrategia"
            className="inline-flex items-center gap-2 text-sm hover:text-[var(--color-brand-primary)] transition-colors"
            style={{ fontWeight: 600 }}
          >
            <ArrowLeft size={16} />
            Volver a EXTRATEGIA
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <div 
        className="relative py-12 md:py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)'
        }}
      >
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            {/* Volume Badge */}
            <div className="mb-6 flex justify-center">
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}
              >
                <BookOpen size={16} />
                {volume.title} — {volume.editorialTitle}
              </span>
            </div>

            {/* Article Title */}
            <h1 
              className="mb-6"
              style={{ 
                fontSize: 'clamp(28px, 6vw, 48px)', 
                fontWeight: 800,
                lineHeight: '1.2',
                letterSpacing: '-0.01em'
              }}
            >
              {article.title}
            </h1>

            {/* Author */}
            <div className="mb-8">
              <div 
                className="inline-flex items-center gap-2 mb-2"
                style={{ fontSize: '18px', fontWeight: 600 }}
              >
                <User size={18} />
                {article.author}
              </div>
              <p 
                className="text-white/90 max-w-2xl mx-auto"
                style={{ fontSize: '14px', lineHeight: '1.6' }}
              >
                {article.authorBio}
              </p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {new Date(volume.publishDate).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>Páginas {article.pageStart}-{article.pageEnd}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Abstract */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 p-8 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 52, 138, 0.05) 0%, rgba(3, 63, 74, 0.05) 100%)',
              border: '2px solid rgba(124, 52, 138, 0.1)'
            }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontSize: '20px', 
                fontWeight: 800,
                color: 'var(--color-brand-primary)'
              }}
            >
              RESUMEN
            </h2>
            <p 
              className="text-gray-700 mb-6"
              style={{ fontSize: '16px', lineHeight: '1.8' }}
            >
              {article.abstract}
            </p>

            {/* Keywords */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} style={{ color: 'var(--color-brand-primary)' }} />
                <span 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 700,
                    color: 'var(--color-brand-primary)'
                  }}
                >
                  PALABRAS CLAVE:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: 'rgba(124, 52, 138, 0.1)',
                      color: 'var(--color-brand-primary)',
                      fontWeight: 600
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose-custom mb-12"
          >
            {/* Introduction */}
            <div 
              className="mb-12 text-gray-800"
              style={{ fontSize: '17px', lineHeight: '1.9' }}
              dangerouslySetInnerHTML={{ 
                __html: introduction
                  .replace(/^# .*\n\n/, '') // Remove title
                  .replace(/\n\n/g, '</p><p class="mb-6">')
                  .replace(/^/, '<p class="mb-6">')
                  .replace(/$/, '</p>')
              }}
            />

            {/* Content Sections */}
            {contentSections.map((section, idx) => {
              const [title, ...contentParts] = section.split('\n\n');
              const content = contentParts.join('\n\n');
              
              return (
                <div key={idx} className="mb-12">
                  <h2 
                    className="mb-6 pb-3 border-b-2"
                    style={{ 
                      fontSize: '26px', 
                      fontWeight: 800,
                      color: 'var(--color-brand-primary)',
                      borderColor: 'rgba(124, 52, 138, 0.2)'
                    }}
                  >
                    {title}
                  </h2>
                  <div 
                    className="text-gray-800"
                    style={{ fontSize: '17px', lineHeight: '1.9' }}
                    dangerouslySetInnerHTML={{ 
                      __html: content
                        .replace(/\n\n/g, '</p><p class="mb-6">')
                        .replace(/^/, '<p class="mb-6">')
                        .replace(/$/, '</p>')
                    }}
                  />
                </div>
              );
            })}
          </motion.article>

          {/* References */}
          {article.references && article.references.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12 p-8 rounded-2xl bg-gray-50"
            >
              <h2 
                className="mb-6"
                style={{ 
                  fontSize: '22px', 
                  fontWeight: 800,
                  color: 'var(--color-brand-primary)'
                }}
              >
                REFERENCIAS BIBLIOGRÁFICAS
              </h2>
              <ol className="space-y-3">
                {article.references.map((ref, idx) => (
                  <li 
                    key={idx}
                    className="text-gray-700"
                    style={{ fontSize: '15px', lineHeight: '1.7' }}
                  >
                    {ref}
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Download Volume CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)'
            }}
          >
            <BookOpen size={48} className="mx-auto mb-4 text-white" />
            <h3 
              className="mb-3 text-white"
              style={{ fontSize: '24px', fontWeight: 800 }}
            >
              Descarga el {volume.title} Completo
            </h3>
            <p className="mb-6 text-white/90" style={{ fontSize: '15px' }}>
              Accede al volumen completo con todos los artículos académicos en formato PDF
            </p>
            <a
              href={volume.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'white',
                color: 'var(--color-brand-primary)',
                fontSize: '16px',
                fontWeight: 700
              }}
            >
              <Download size={20} />
              Descargar PDF Completo
            </a>
            <p className="mt-3 text-white/70 text-xs">
              {volume.pageCount} páginas • Acceso gratuito
            </p>
          </motion.div>

          {/* More Articles from Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <h3 
              className="mb-6"
              style={{ 
                fontSize: '24px', 
                fontWeight: 800,
                color: 'var(--color-brand-primary)'
              }}
            >
              Más artículos de este volumen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {volume.articles
                .filter(a => a.id !== article.id)
                .map((otherArticle) => (
                  <Link
                    key={otherArticle.id}
                    to={`/extrategia/${volume.id}/${otherArticle.id}`}
                    className="block p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ 
                          backgroundColor: 'var(--color-brand-primary)',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                      >
                        {otherArticle.pageStart}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors"
                          style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.4' }}
                        >
                          {otherArticle.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {otherArticle.author}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
