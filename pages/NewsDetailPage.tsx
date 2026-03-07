import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { SectionTag, SectionType } from '../components/SectionTag';
import { NewsCard } from '../components/NewsCard';
import { SectionHeader } from '../components/SectionHeader';
import { InstagramStoryGenerator } from '../components/InstagramStoryGenerator';
import { FloatingShareButton } from '../components/FloatingShareButton';
import { ArrowLeft, Clock, Calendar, User, Share2, Facebook, Twitter, Linkedin, Instagram, Link2, MessageCircle, Share, Bookmark } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArticleAudioPlayer } from '../components/ArticleAudioPlayer';
import { AdBanner } from '../components/AdBanner';
import { CommentSection } from '../components/comments/CommentSection';
import { useEngagementTracker } from '../hooks/useEngagementTracker';
import { Tweet } from 'react-tweet';
import { InstagramEmbed } from 'react-social-media-embed';
import { ArticleBlock } from './admin/ArticleEditor';
import { useAdmin } from '../contexts/AdminContext';
import { toast } from 'sonner';

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

  // Newsletter logic
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const subscribe = useMutation(api.newsletters.subscribe);

  // Bookmark logic
  const { currentUser } = useAdmin();
  const userId = currentUser?._id;
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, {
    userId: userId ?? undefined,
    articleId: article?._id ?? undefined
  });
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para guardar artículos");
      return;
    }
    if (article?._id) {
      try {
        await toggleBookmark({ articleId: article._id, userId: currentUser._id });
        toast.success(isBookmarked ? "Artículo eliminado de guardados" : "Artículo guardado para leer después");
      } catch (e) {
        toast.error("Error al guardar el artículo");
      }
    }
  };

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

  const handleSubscribe = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setIsSubscribing(true);
    try {
      const result = await subscribe({ email });
      if (result === 'subscribed' || result === 'resubscribed') {
        toast.success('¡Te has suscrito con éxito al Newsletter!');
        setEmail('');
      } else if (result === 'already_subscribed') {
        toast.info('Este correo ya se encuentra suscrito.');
        setEmail('');
      }
    } catch (e) {
      toast.error('Ocurrió un error al procesar la suscripción.');
    } finally {
      setIsSubscribing(false);
    }
  };

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

  const metaTitle = article.metaTitle || `${article.title} | Punto de Partida`;
  const metaDescription = article.metaDescription || article.description;
  const ogImage = article.ogImage || article.imageUrl;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="article:published_time" content={article.publishDate || article.date} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.section} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={metaTitle} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={ogImage} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-4 md:py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--color-brand-primary)] dark:hover:text-[var(--color-brand-primary)] transition-colors"
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
            className="mb-6 text-[#1a1a1a] dark:text-gray-100"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: '1.15'
            }}
          >
            {article.title}
          </h1>

          {/* Description */}
          <p
            className="mb-8 text-gray-700 dark:text-gray-300"
            style={{
              fontSize: '20px',
              lineHeight: '1.6',
              fontWeight: 400
            }}
          >
            {article.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-between pb-4 md:pb-6 mb-6 md:mb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User size={16} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{article.author}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                <span style={{ fontSize: '14px' }}>{formatDate(article.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock size={16} />
                <span style={{ fontSize: '14px' }}>{article.readTime} min de lectura</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex shrink-0">
              <button
                onClick={handleBookmarkToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
              >
                <Bookmark size={18} className={isBookmarked ? "fill-[var(--color-brand-primary)] text-[var(--color-brand-primary)]" : ""} />
                <span className="text-sm font-medium">{isBookmarked ? 'Guardado' : 'Guardar'}</span>
              </button>
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

          {/* Accessibility Option */}
          <ArticleAudioPlayer title={article.title} blocks={article.content} />

          {/* Article Content */}
          <div className="relative prose prose-lg max-w-none mb-8 md:mb-12">
            {(() => {
              const requiresLogin = article.isPremium && !currentUser;
              const PremiumCTA = () => (
                <div className="relative mt-2 p-8 md:p-12 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl text-center z-10 mx-[-20px] md:mx-0">
                  <div className="absolute inset-x-0 top-[-150px] h-[150px] bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] mb-6">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Artículo Premium exclusivo</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                    Iniciá sesión o registrate para continuar leyendo y acceder a todo nuestro contenido periodístico.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/auth?mode=login" className="px-8 py-3 rounded-xl bg-[var(--color-brand-primary)] text-white font-semibold hover:scale-105 transition-transform w-full sm:w-auto sm:flex-1 max-w-[200px] shadow-lg shadow-[var(--color-brand-primary)]/30 text-center">
                      Iniciar Sesión
                    </Link>
                    <Link to="/auth?mode=register" className="px-8 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors w-full sm:w-auto sm:flex-1 max-w-[200px] text-center">
                      Registro Gratuito
                    </Link>
                  </div>
                </div>
              );

              try {
                const parsedBlocks: ArticleBlock[] = JSON.parse(article.content);
                if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
                  const blocksToRender = requiresLogin ? parsedBlocks.slice(0, 2) : parsedBlocks;
                  const renderedBlocks = blocksToRender.map((block, index: number) => {
                    if (!block.content?.trim() && block.type !== 'image') return null;

                    switch (block.type) {
                      case 'text':
                        return (
                          <div
                            key={block.id || index}
                            className="prose prose-lg max-w-none mb-6 text-gray-800 dark:text-gray-200 dark:prose-invert"
                            style={{
                              fontSize: '18px',
                              lineHeight: '1.8'
                            }}
                            dangerouslySetInnerHTML={{ __html: block.content }}
                          />
                        );

                      case 'image':
                        if (!block.content) return null;
                        return (
                          <figure key={block.id || index} className="my-10 md:my-14 border rounded-xl p-2 bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                            <img
                              src={block.content}
                              alt={block.metadata?.caption || 'Imagen del artículo'}
                              loading="lazy"
                              decoding="async"
                              className="w-full rounded-lg shadow-sm"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            {block.metadata?.caption && (
                              <figcaption className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400 mt-3 italic">
                                {block.metadata.caption}
                              </figcaption>
                            )}
                          </figure>
                        );

                      case 'embed':
                        if (!block.content) return null;
                        const isTwitter = block.content.includes('twitter.com') || block.content.includes('x.com');
                        const isInstagram = block.content.includes('instagram.com');

                        if (isTwitter) {
                          const tweetMatch = block.content.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
                          const tweetId = tweetMatch ? tweetMatch[3] : null;

                          if (tweetId) {
                            return (
                              <div key={block.id || index} className="my-10 flex justify-center w-full light">
                                <Tweet id={tweetId} />
                              </div>
                            );
                          }
                        }

                        if (isInstagram) {
                          return (
                            <div key={block.id || index} className="my-10 flex justify-center w-full">
                              <InstagramEmbed url={block.content} width={328} />
                            </div>
                          );
                        }

                        return (
                          <div key={block.id || index} className="my-10 flex justify-center w-full">
                            <a href={block.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2 text-base font-medium p-4 border border-blue-100 bg-blue-50 rounded-lg">
                              <Link2 size={20} /> Ver contenido externo
                            </a>
                          </div>
                        );

                      default:
                        return null;
                    }
                  });

                  // Insert an ad in the middle of the blocks if there are more than 3
                  if (renderedBlocks.length > 3) {
                    const midPoint = Math.floor(renderedBlocks.length / 2);
                    renderedBlocks.splice(midPoint, 0, (
                      <div key="ad-banner" className="my-10 flex justify-center w-full">
                        <AdBanner position="in-article" className="w-full md:w-[600px] h-[150px] md:h-[250px]" />
                      </div>
                    ) as any);
                  }

                  return (
                    <div className="relative">
                      {renderedBlocks}
                      {requiresLogin && <PremiumCTA />}
                    </div>
                  );
                }
              } catch (e) {
                // Fallback for old plain text articles
              }

              // Fallback return
              const paragraphs = article.content.split('\n\n');
              const toRender = requiresLogin ? paragraphs.slice(0, 2) : paragraphs;
              const renderedFb = toRender.map((paragraph: string, index: number) => (
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
              ));
              return (
                <div className="relative">
                  {renderedFb}
                  {requiresLogin && <PremiumCTA />}
                </div>
              );
            })()}
          </div>

          {/* Share Section */}
          <div
            className="p-4 md:p-6 rounded-xl mb-8 md:mb-12 bg-[#f9f9f9] dark:bg-gray-900 border border-transparent dark:border-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="flex items-center gap-3">
                <Share2 size={20} style={{ color: '#7c348a' }} />
                <span className="text-gray-900 dark:text-gray-100 transition-colors" style={{ fontSize: '16px', fontWeight: 600 }}>
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
                <button
                  onClick={() => {
                    handleShareClick('whatsapp', 'inline');
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + currentUrl)}`, '_blank');
                  }}
                  className="w-11 h-11 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                  aria-label="Compartir en WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={() => {
                      handleShareClick('native', 'inline');
                      navigator.share({
                        title: article.title,
                        url: currentUrl
                      }).catch(console.error);
                    }}
                    className="w-11 h-11 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    aria-label="Más opciones"
                  >
                    <Share size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Instagram Story CTA */}
            <div
              className="border-t border-[#e5e5e5] dark:border-gray-800 pt-3 md:pt-4 transition-colors"
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
                className="text-center text-gray-500 dark:text-gray-400 mt-2 transition-colors"
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
                  {article.authorBio || `Periodista especializado en ${article.section}. Con más de 10 años de experiencia cubriendo los acontecimientos más importantes del país.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {
          relatedArticles.length > 0 && (
            <div className="max-w-7xl mx-auto mb-12">
              <SectionHeader title="Noticias que también te pueden interesar" />
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
          )
        }

        {/* Comments Section */}
        <CommentSection articleId={article._id} />
      </article >

      {/* Newsletter CTA */}
      < section
        className="py-10 md:py-16 bg-[#f9f9f9] dark:bg-gray-900 transition-colors"
      >
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] text-center">
          <h2
            className="mb-4 text-gray-900 dark:text-gray-100 transition-colors"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}
          >
            ¿Te gustó esta nota?
          </h2>
          <p
            className="text-gray-700 dark:text-gray-400 mb-8 max-w-2xl mx-auto transition-colors"
            style={{ fontSize: '16px', lineHeight: '1.6' }}
          >
            Suscribite a nuestro newsletter para recibir más contenido como este
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              disabled={isSubscribing}
              className="flex-1 px-5 md:px-6 py-3.5 md:py-3 rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all disabled:opacity-50"
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="px-6 md:px-8 py-3.5 md:py-3 rounded-lg transition-all hover:scale-105 active:scale-95 touch-manipulation whitespace-nowrap disabled:opacity-50 disabled:hover:scale-100"
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              {isSubscribing ? 'Procesando...' : 'Suscribirme'}
            </button>
          </div>
        </div>
      </section >

      {/* Instagram Story Generator Modal */}
      < InstagramStoryGenerator
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
    </div >
  );
};
