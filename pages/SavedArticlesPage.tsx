import React from 'react';
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAdmin } from '../contexts/AdminContext';
import { Link, Navigate } from 'react-router-dom';
import { NewsCard } from '../components/NewsCard';
import { SectionType } from '../components/SectionTag';
import { Bookmark, ArrowLeft } from 'lucide-react';

export const SavedArticlesPage: React.FC = () => {
    const { currentUser } = useAdmin();

    if (!currentUser) {
        return <Navigate to="/panel/login" replace />;
    }

    const savedArticles = useQuery(api.bookmarks.getUserBookmarks, { userId: currentUser._id });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors">
            <div className="container mx-auto px-5 md:px-10 lg:px-[60px]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                            <Bookmark className="text-[var(--color-brand-primary)] fill-[var(--color-brand-primary)]" size={32} />
                            Mis Guardados
                        </h1>
                    </div>

                    {savedArticles === undefined ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-brand-primary)]"></div>
                        </div>
                    ) : savedArticles.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <Bookmark size={32} className="text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Aún no tienes artículos guardados</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">Explora las noticias y usa el ícono de guardado en el artículo de tu interés para leerlas más tarde.</p>
                            <Link to="/" className="inline-block px-8 py-3 bg-[var(--color-brand-primary)] text-white rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all">
                                Explorar Noticias
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                            {savedArticles.map((article: any) => (
                                <div key={article._id} className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800">
                                    <Link to={`/noticia/${article._id}`} className="block flex-1">
                                        <NewsCard
                                            variant="standard"
                                            title={article.title}
                                            section={article.section as SectionType}
                                            imageUrl={article.imageUrl}
                                            description={article.description}
                                        />
                                    </Link>
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        Guardado el {new Date(article.bookmarkedAt).toLocaleDateString('es-AR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
