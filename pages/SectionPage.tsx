import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SectionType } from '../components/SectionTag';
import { NewsCard } from '../components/NewsCard';
import { SectionHeader } from '../components/SectionHeader';
import { useArticles } from '../hooks/useArticles';
import { ArrowLeft } from 'lucide-react';

const sectionTitles: Record<SectionType, string> = {
  politica: 'Política',
  economia: 'Economía',
  internacional: 'Internacional',
  local: 'Local',
  opinion: 'Opinión',
  extrategia: 'EXTRATEGIA',
};

export const SectionPage: React.FC = () => {
  const location = useLocation();
  const section = location.pathname.replace('/', '') as SectionType;
  const allArticles = useArticles();
  const articles = allArticles.filter(a => a.section === section);
  
  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const otherArticles = articles.filter(a => a.id !== featuredArticle?.id);

  if (!section || !sectionTitles[section]) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4" style={{ fontSize: '32px', fontWeight: 700 }}>
          Sección no encontrada
        </h1>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 hover:text-[var(--color-brand-primary)] transition-colors"
          style={{ fontSize: '16px', fontWeight: 500 }}
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[var(--color-brand-primary)] transition-colors"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          <ArrowLeft size={18} />
          Inicio
        </Link>
      </div>

      {/* Section Header */}
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-8 md:mb-12">
        <SectionHeader 
          title={sectionTitles[section]} 
          section={section} 
          showLink={false}
        />
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-10 md:mb-14">
          <Link to={`/noticia/${featuredArticle.id}`}>
            <NewsCard
              variant="hero"
              title={featuredArticle.title}
              section={featuredArticle.section}
              imageUrl={featuredArticle.imageUrl}
              description={featuredArticle.description}
            />
          </Link>
        </div>
      )}

      {/* Other Articles */}
      {otherArticles.length > 0 ? (
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {otherArticles.map((article) => (
              <Link key={article.id} to={`/noticia/${article.id}`}>
                <NewsCard
                  variant="standard"
                  title={article.title}
                  section={article.section}
                  imageUrl={article.imageUrl}
                  description={article.description}
                />
              </Link>
            ))}
          </div>
        </div>
      ) : !featuredArticle ? (
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-20 text-center">
          <p className="text-gray-600" style={{ fontSize: '18px' }}>
            No hay artículos disponibles en esta sección.
          </p>
        </div>
      ) : null}
    </div>
  );
};
