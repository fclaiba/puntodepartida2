import React, { useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { NewsCard } from '../components/NewsCard';
import { SectionType } from '../components/SectionTag';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all public articles for client-side filtering
  const allArticlesRaw = useQuery(api.articles.getPublic, {});
  const allArticles = (allArticlesRaw || []).filter((a): a is NonNullable<typeof a> => a !== null);

  const activeQueryParam = (searchParams.get('q') || '').trim();

  const results = useMemo(() => {
    if (!activeQueryParam) {
      return [];
    }

    const searchTerm = activeQueryParam.toLowerCase();
    return allArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      article.author.toLowerCase().includes(searchTerm)
    );
  }, [activeQueryParam, allArticles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value?.trim() ?? '';
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

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
          Volver al inicio
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <h1
            className="mb-6 text-center"
            style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 800 }}
          >
            Buscar Noticias
          </h1>

          <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl focus-within:border-[var(--color-brand-primary)] transition-colors">
            <Search size={24} className="text-gray-400" />
            <input
              ref={inputRef}
              key={activeQueryParam}
              type="text"
              defaultValue={activeQueryParam}
              placeholder="Buscar por título, autor o contenido..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: '16px' }}
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Results */}
        {activeQueryParam && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2
                className="text-gray-700"
                style={{ fontSize: '18px', fontWeight: 600 }}
              >
                {results.length > 0
                  ? `Se encontraron ${results.length} resultado${results.length !== 1 ? 's' : ''} para "${activeQueryParam}"`
                  : `No se encontraron resultados para "${activeQueryParam}"`
                }
              </h2>
            </div>

            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <Link key={article._id} to={`/noticia/${article._id}`}>
                    <NewsCard
                      variant="standard"
                      title={article.title}
                      section={article.section as SectionType}
                      imageUrl={article.imageUrl}
                      description={article.description}
                    />
                  </Link>
                ))}
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Search size={64} className="mx-auto text-gray-300" />
                </div>
                <p className="text-gray-600 mb-2" style={{ fontSize: '16px' }}>
                  No encontramos artículos que coincidan con tu búsqueda.
                </p>
                <p className="text-gray-500" style={{ fontSize: '14px' }}>
                  Intenta con otras palabras clave o explora nuestras secciones.
                </p>
              </div>
            )}
          </div>
        )}

        {!activeQueryParam && (
          <div className="text-center py-12">
            <div className="mb-4">
              <Search size={64} className="mx-auto text-gray-300" />
            </div>
            <p className="text-gray-600" style={{ fontSize: '16px' }}>
              Ingresa una palabra clave para buscar noticias
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
