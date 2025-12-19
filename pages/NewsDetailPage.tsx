import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { SectionTag, SectionType } from '../components/SectionTag';
import { NewsCard } from '../components/NewsCard';
import { SectionHeader } from '../components/SectionHeader';
import { InstagramStoryGenerator } from '../components/InstagramStoryGenerator';
import { FloatingShareButton } from '../components/FloatingShareButton';
import { ArrowLeft, Clock, Calendar, User, Share2, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CommentSection } from '../components/comments/CommentSection';
import { useEngagementTracker } from '../hooks/useEngagementTracker';

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch article by ID
  const article = useQuery(api.articles.getById, { id: id as Id<"articles"> });
  const recordArticleView = useMutation(api.analytics.recordArticleView);

  // Fetch related articles (same section)
  const relatedArticlesRaw = useQuery(api.articles.getPublic, article ? { section: article.section, limit: 4 } : "skip");

  const relatedArticles = relatedArticlesRaw
    ? relatedArticlesRaw.filter((a): a is NonNullable<typeof a> => a !== null && a._id !== article?._id).slice(0, 3)
    : [];

  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const articleId = article?._id as Id<"articles"> | undefined;
  const { trackEvent, trackShare } = useEngagementTracker({ articleId });

  useEffect(() => {
    if (!article) return;
    if (typeof window === 'undefined') return;

    const storageKey = 'pdp_article_views';
    const articleKey = article._id as unknown as string;

    const registerView = async () => {
      try {
        const stored = localStorage.getItem(storageKey);
        const viewedMap: Record<string, number> = stored ? JSON.parse(stored) : {};
        const lastRecorded = viewedMap[articleKey];
        const now = Date.now();
        const thirtyMinutes = 1000 * 60 * 30;

        if (!lastRecorded || now - lastRecorded > thirtyMinutes) {
          await recordArticleView({ articleId: article._id });
          viewedMap[articleKey] = now;
          localStorage.setItem(storageKey, JSON.stringify(viewedMap));
        }
      } catch (error) {
        console.warn('No se pudo registrar la vista del artículo', error);
      }
    };

    registerView();
  }, [article, recordArticleView]);

  useEffect(() => {
    if (!articleId) return;
    trackEvent({ eventType: 'article_view' });
  }, [articleId, trackEvent]);

  const handleShareClick = useCallback(
    (platform: string, surface: 'inline' | 'floating', action?: string) => {
      const metadata = {
        platform,
        surface,
        ...(action ? { action } : {}),
      };

      void trackEvent({ eventType: 'share_click', metadata });
      void trackShare({
        channel: platform,
        surface,
        action,
      });
    },
    [trackEvent, trackShare]
  );

  const handleNewsletterCTA = useCallback(() => {
    void trackEvent({
      eventType: 'newsletter_cta_click',
      metadata: { surface: 'article_bottom' },
    });
  }, [trackEvent]);

  const handleFloatingShare = useCallback(
    ({ platform, surface, action }: { platform: string; surface: 'floating'; action?: string }) => {
      handleShareClick(platform, surface, action);
    },
    [handleShareClick]
  );

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Loading state
  if (article === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4" style={{ fontSize: '32px', fontWeight: 700 }}>
          Artículo no encontrado
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

      {/* Article Header */}
      <article className="container mx-auto px-5 md:px-10 lg:px-[60px] pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Category Tag */}
          <div className="mb-6">
            <SectionTag section={article.section as SectionType} variant="light" />
          </div>

          {/* Title */}
          <h1
            className="mb-6"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: '1.15',
              color: '#1a1a1a'
            }}
          >
            {article.title}
          </h1>

          {/* Description */}
          <p
            className="mb-8 text-gray-700"
            style={{
              fontSize: '20px',
              lineHeight: '1.6',
              fontWeight: 400
            }}
          >
            {article.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-4 md:pb-6 mb-6 md:mb-8 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={16} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{article.author}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span style={{ fontSize: '14px' }}>{formatDate(article.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span style={{ fontSize: '14px' }}>{article.readTime} min de lectura</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-6 md:mb-10 rounded-xl md:rounded-2xl overflow-hidden">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8 md:mb-12">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="mb-6 text-gray-800"
                style={{
                  fontSize: '18px',
                  lineHeight: '1.8',
                  fontWeight: 300
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Share Section */}
          <div
            className="p-4 md:p-6 rounded-xl mb-8 md:mb-12"
            style={{ backgroundColor: '#f9f9f9' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="flex items-center gap-3">
                <Share2 size={20} style={{ color: '#7c348a' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>
                  Compartir esta noticia
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => {
                    handleShareClick('facebook', 'inline');
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
                  }}
                  className="w-11 h-11 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation"
                  style={{ backgroundColor: '#1877f2', color: 'white' }}
                  aria-label="Compartir en Facebook"
                >
                  <Facebook size={18} />
                </button>
                <button
                  onClick={() => {
                    handleShareClick('twitter', 'inline');
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`, '_blank');
                  }}
                  className="w-11 h-11 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation"
                  style={{ backgroundColor: '#1da1f2', color: 'white' }}
                  aria-label="Compartir en Twitter"
                >
                  <Twitter size={18} />
                </button>
                <button
                  onClick={() => {
                    handleShareClick('linkedin', 'inline');
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
                  }}
                  className="w-11 h-11 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation"
                  style={{ backgroundColor: '#0a66c2', color: 'white' }}
                  aria-label="Compartir en LinkedIn"
                >
                  <Linkedin size={18} />
                </button>
              </div>
            </div>

            {/* Instagram Story CTA */}
            <div
              className="border-t pt-3 md:pt-4"
              style={{ borderColor: '#e5e5e5' }}
            >
              <button
                onClick={() => {
                  handleShareClick('instagram', 'inline', 'open');
                  setIsInstagramModalOpen(true);
                }}
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 md:gap-3"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600
                }}
              >
                <Instagram size={20} />
                <span className="hidden sm:inline">Compartir en Instagram Stories</span>
                <span className="sm:hidden">Instagram Stories</span>
              </button>
              <p
                className="text-center text-gray-500 mt-2"
                style={{ fontSize: '12px' }}
              >
                Genera una imagen optimizada para Stories con link incluido
              </p>
            </div>
          </div>

          {/* Author Card */}
          <div
            className="p-5 md:p-8 rounded-xl mb-12 md:mb-16"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-neutral-500) 100%)'
            }}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <User size={24} className="text-white md:hidden" />
                <User size={32} className="text-white hidden md:block" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-white mb-1 md:mb-2"
                  style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700 }}
                >
                  {article.author}
                </h3>
                <p
                  className="text-white/90"
                  style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: '1.6' }}
                >
                  Periodista especializado en {article.section}. Con más de 10 años de experiencia cubriendo los acontecimientos más importantes del país.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-7xl mx-auto mb-12">
            <SectionHeader title="Noticias relacionadas" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link key={relatedArticle._id} to={`/noticia/${relatedArticle._id}`}>
                  <NewsCard
                    variant="standard"
                    title={relatedArticle.title}
                    section={relatedArticle.section as SectionType}
                    imageUrl={relatedArticle.imageUrl}
                    description={relatedArticle.description}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection articleId={article._id} />
      </article>

      {/* Newsletter CTA */}
      <section
        className="py-10 md:py-16"
        style={{ backgroundColor: '#f9f9f9' }}
      >
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] text-center">
          <h2
            className="mb-4"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}
          >
            ¿Te gustó esta nota?
          </h2>
          <p
            className="text-gray-700 mb-8 max-w-2xl mx-auto"
            style={{ fontSize: '16px', lineHeight: '1.6' }}
          >
            Suscribite a nuestro newsletter para recibir más contenido como este
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-5 md:px-6 py-3.5 md:py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={handleNewsletterCTA}
              className="px-6 md:px-8 py-3.5 md:py-3 rounded-lg transition-all hover:scale-105 active:scale-95 touch-manipulation whitespace-nowrap"
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Suscribirme
            </button>
          </div>
        </div>
      </section>

      {/* Instagram Story Generator Modal */}
      <InstagramStoryGenerator
        article={{ ...article, id: article._id, section: article.section as SectionType }}
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
      />

      {/* Floating Share Button */}
      <FloatingShareButton
        onInstagramClick={() => setIsInstagramModalOpen(true)}
        articleTitle={article.title}
        articleUrl={currentUrl}
        onShare={handleFloatingShare}
      />
    </div>
  );
};
