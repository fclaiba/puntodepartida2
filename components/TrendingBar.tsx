import React, { useEffect, useMemo, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useEngagementTracker } from "../hooks/useEngagementTracker";

type TrendingArticle = {
  id: Id<"articles">;
  title: string;
  path: string;
  section?: string;
};

const buildRepeatedArticles = (articles: TrendingArticle[]) => {
  if (articles.length === 0) {
    return [];
  }

  if (articles.length === 1) {
    return [...articles, ...articles, ...articles];
  }

  return [...articles, ...articles];
};

export const TrendingBar: React.FC = () => {
  const queryResult = useQuery(api.articles.getPublic, {
    limit: 5,
  });
  const { trackEvent } = useEngagementTracker();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const hasLoggedEmptyStateRef = useRef(false);
  const hasLoggedErrorRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  const { articles, loadState, processingError } = useMemo(() => {
    if (queryResult === undefined) {
      return { articles: [] as TrendingArticle[], loadState: "loading" as const, processingError: null as string | null };
    }

    try {
      const sanitized = (queryResult ?? [])
        .filter((article): article is NonNullable<typeof article> => !!article)
        .filter((article) => (article.status ?? "published") === "published")
        .filter((article) => (article.source ?? "internal") === "internal")
        .map((article) => ({
          id: article._id,
          title: article.title,
          path: `/noticia/${article._id}`,
          section: article.section,
          views: article.views ?? 0,
          publishDate: article.publishDate ?? article.date ?? "",
          creationTime: article._creationTime ?? 0,
        }))
        .sort((a, b) => {
          if (a.views !== b.views) {
            return b.views - a.views;
          }
          if (a.publishDate !== b.publishDate) {
            return a.publishDate > b.publishDate ? -1 : 1;
          }
          return b.creationTime - a.creationTime;
        })
        .map(({ views: _views, publishDate: _publishDate, creationTime: _creationTime, ...article }) => article);

      return { articles: sanitized, loadState: "ready" as const, processingError: null as string | null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error procesando las tendencias";

      return { articles: [] as TrendingArticle[], loadState: "error" as const, processingError: message };
    }
  }, [queryResult]);

  useEffect(() => {
    if (loadState === "loading") {
      return;
    }

    if (loadState === "error" && processingError) {
      if (!hasLoggedErrorRef.current) {
        hasLoggedErrorRef.current = true;
        void trackEvent({
          eventType: "trending_error",
          metadata: { surface: "trending_bar", message: processingError },
        });
      }
      return;
    }

    if (articles.length === 0) {
      if (!hasLoggedEmptyStateRef.current) {
        hasLoggedEmptyStateRef.current = true;
        void trackEvent({
          eventType: "trending_empty_state",
          metadata: { surface: "trending_bar" },
        });
      }
    } else {
      hasLoggedEmptyStateRef.current = false;
      hasLoggedErrorRef.current = false;
    }
  }, [articles, loadState, processingError, trackEvent]);

  const isLoading = loadState === "loading";

  const repeatedArticles = useMemo(
    () => buildRepeatedArticles(articles),
    [articles]
  );

  const marqueeDuration = useMemo(() => {
    if (repeatedArticles.length === 0) {
      return 18;
    }

    return Math.max(16, repeatedArticles.length * 4);
  }, [repeatedArticles.length]);

  const renderSkeleton = () => (
    <div className="flex items-center gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-3 w-24 md:w-32 rounded-full bg-gray-200/80 animate-pulse"
        />
      ))}
    </div>
  );

  const renderFallback = (message: string) => (
    <div
      className="text-xs md:text-sm font-medium text-gray-500"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );

  const renderAnimatedTopics = () => {
    if (prefersReducedMotion) {
      return (
        <div className="flex items-center gap-4 md:gap-6" role="list">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              to={article.path}
              className="flex-shrink-0 text-xs md:text-sm font-medium text-gray-700 hover:text-[var(--color-brand-primary)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
              aria-label={`Ir a la nota: ${article.title}`}
              title={article.title}
              onClick={() => {
                void trackEvent({
                  eventType: "trending_click",
                  articleId: article.id,
                  metadata: {
                    surface: "trending_bar",
                    index,
                    title: article.title,
                  },
                });
              }}
            >
              <span className="line-clamp-1">{article.title}</span>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <motion.div
        className="flex items-center gap-4 md:gap-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: marqueeDuration,
          ease: "linear",
        }}
        role="list"
      >
        {repeatedArticles.map((article, index) => (
          <Link
            key={`${article.id}-${index}`}
            to={article.path}
            className="flex-shrink-0 text-xs md:text-sm font-medium text-gray-700 hover:text-[var(--color-brand-primary)] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
            aria-label={`Ir a la nota: ${article.title}`}
            title={article.title}
            onClick={() => {
              void trackEvent({
                eventType: "trending_click",
                articleId: article.id,
                metadata: {
                  surface: "trending_bar",
                  index: index % Math.max(articles.length, 1),
                  title: article.title,
                },
              });
            }}
          >
            <span className="line-clamp-1">{article.title}</span>
          </Link>
        ))}
      </motion.div>
    );
  };

  let content: React.ReactNode = null;

  if (isLoading) {
    content = renderSkeleton();
  } else if (processingError) {
    content = renderFallback("No pudimos cargar las tendencias internas.");
  } else if (articles.length === 0) {
    content = renderFallback("No hay noticias internas publicadas por ahora.");
  } else {
    content = renderAnimatedTopics();
  }

  return (
    <div
      className="relative py-2 md:py-3 border-y border-gray-200 bg-[var(--color-brand-neutral-050,#f9f9f9)] overflow-hidden"
      role="region"
      aria-label="Notas en tendencia de nuestra plataforma"
    >
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px]">
        <div className="relative flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <TrendingUp
              size={16}
              className="md:hidden text-[var(--color-brand-primary)]"
            />
            <TrendingUp
              size={18}
              className="hidden md:block text-[var(--color-brand-primary)]"
            />
            <span
              className="hidden sm:inline text-[var(--color-brand-primary)] uppercase tracking-[0.12em]"
              style={{
                fontSize: "clamp(11px, 2vw, 13px)",
                fontWeight: 700,
              }}
            >
              Tendencias
            </span>
          </div>

          <div className="flex-1 overflow-hidden">{content}</div>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-16 bg-gradient-to-l from-[var(--color-brand-neutral-050,#f9f9f9)] to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

