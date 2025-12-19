import React from 'react';
import { motion } from 'motion/react';
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { HeroSection } from '../components/HeroSection';
import { NewsCard } from '../components/NewsCard';
import { SectionHeader } from '../components/SectionHeader';
import { TrendingBar } from '../components/TrendingBar';
import { Separator } from '../components/ui/separator';
import { Link } from 'react-router-dom';
import { SectionType } from '../components/SectionTag';

export const HomePage: React.FC = () => {
  const newsArticlesRaw = useQuery(api.articles.getPublic, { limit: 20 });
  const newsArticles = (newsArticlesRaw || []).filter((a): a is NonNullable<typeof a> => a !== null);
  const heroNews = newsArticles.find(n => n.featured) || newsArticles[0];
  const featuredNews = newsArticles.filter(n => n.featured && n._id !== heroNews?._id).slice(0, 2);
  const politicaNews = newsArticles.filter(n => n.section === 'politica').slice(0, 3);
  const internacionalNews = newsArticles.filter(n => n.section === 'internacional').slice(0, 3);
  const compactNews = [
    ...newsArticles.filter(n => n.section === 'economia').slice(0, 1),
    ...newsArticles.filter(n => n.section === 'local').slice(0, 1),
    ...newsArticles.filter(n => n.section === 'opinion').slice(0, 2),
  ];

  // Loading state
  if (!heroNews && newsArticles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TrendingBar />

      <main>
        {/* Hero Section */}
        {heroNews && (
          <section className="mb-6 md:mb-10 lg:mb-12">
            <Link to={`/noticia/${heroNews._id}`}>
              <HeroSection
                title={heroNews.title}
                section={heroNews.section as SectionType}
                imageUrl={heroNews.imageUrl}
                description={heroNews.description}
              />
            </Link>
          </section>
        )}

        {/* Featured News Grid */}
        <section className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-10 md:mb-14 lg:mb-16">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {featuredNews.map((news, index) => (
              <motion.div
                key={news._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Link to={`/noticia/${news._id}`}>
                  <NewsCard
                    variant="featured"
                    title={news.title}
                    section={news.section as SectionType}
                    imageUrl={news.imageUrl}
                    description={news.description}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-6 md:mb-8">
          <Separator />
        </div>

        {/* Política Section */}
        <section className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-10 md:mb-14 lg:mb-16">
          <SectionHeader title="Política" section="politica" link="/politica" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {politicaNews.map((news) => (
              <Link key={news._id} to={`/noticia/${news._id}`}>
                <NewsCard
                  variant="standard"
                  title={news.title}
                  section={news.section as SectionType}
                  imageUrl={news.imageUrl}
                  description={news.description}
                />
              </Link>
            ))}
          </div>
        </section>

        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-6 md:mb-8">
          <Separator />
        </div>

        {/* International Section */}
        <section className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-10 md:mb-14 lg:mb-16">
          <SectionHeader title="Internacional" section="internacional" link="/internacional" />
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {internacionalNews.map((news) => (
              <Link key={news._id} to={`/noticia/${news._id}`}>
                <NewsCard
                  variant="horizontal"
                  title={news.title}
                  section={news.section as SectionType}
                  imageUrl={news.imageUrl}
                  description={news.description}
                />
              </Link>
            ))}
          </div>
        </section>

        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-6 md:mb-8">
          <Separator />
        </div>

        {/* More News Section */}
        <section className="container mx-auto px-5 md:px-10 lg:px-[60px] mb-10 md:mb-14 lg:mb-16">
          <SectionHeader title="Más noticias" link="#mas-noticias" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {compactNews.map((news) => (
              <Link key={news._id} to={`/noticia/${news._id}`}>
                <NewsCard
                  variant="compact"
                  title={news.title}
                  section={news.section as SectionType}
                  imageUrl={news.imageUrl}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section
          className="py-12 md:py-16 lg:py-20 mb-12 md:mb-16"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-neutral-500) 100%)'
          }}
        >
          <div className="container mx-auto px-5 md:px-10 lg:px-[60px] text-center">
            <h2
              className="text-white mb-3 md:mb-4 px-4"
              style={{
                fontSize: 'clamp(24px, 5vw, 40px)',
                fontWeight: 700,
                lineHeight: '1.2'
              }}
            >
              No te pierdas ninguna noticia importante
            </h2>
            <p
              className="text-white/95 mb-6 md:mb-8 max-w-2xl mx-auto px-4"
              style={{
                fontSize: 'clamp(15px, 3vw, 16px)',
                lineHeight: '1.6'
              }}
            >
              Recibí las últimas noticias, análisis exclusivos y reportajes especiales directamente en tu correo
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-5 md:px-6 py-3.5 md:py-4 rounded-lg outline-none focus:ring-2 focus:ring-white/30 transition-all"
                style={{ fontSize: '16px' }}
              />
              <button
                className="px-6 md:px-8 py-3.5 md:py-4 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg touch-manipulation whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--color-brand-secondary)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                Suscribirme gratis
              </button>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
};
