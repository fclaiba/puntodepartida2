import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { NewsSections } from '../../data/newsData';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

const ArticleListContent: React.FC = () => {
  const { currentUser } = useAdmin();
  const articlesRaw = useQuery(api.articles.getAll);
  const articles = (articlesRaw || []).filter((a): a is NonNullable<typeof a> => a !== null);
  const deleteArticle = useMutation(api.articles.remove);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === 'all' || article.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const handleDelete = async (id: Id<"articles">, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${title}"?`)) {
      try {
        await deleteArticle({ id });
        toast.success('Artículo eliminado con éxito');
      } catch (error) {
        toast.error('Error al eliminar el artículo');
        console.error(error);
      }
    }
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '4px' }}>
              Artículos
            </h1>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              {filteredArticles.length} artículo{filteredArticles.length !== 1 ? 's' : ''} {selectedSection !== 'all' ? `en ${selectedSection}` : 'total'}
            </p>
          </div>

          {canEdit && (
            <Link
              to="/panel/articles/new"
              className="px-6 py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <Plus size={20} />
              Nuevo Artículo
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, descripción o autor..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Section Filter */}
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all appearance-none"
                style={{ fontSize: '16px' }}
              >
                <option value="all">Todas las secciones</option>
                {NewsSections.map((section) => (
                  <option key={section} value={section}>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No se encontraron artículos
            </h3>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              {searchQuery || selectedSection !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Comienza creando tu primer artículo'}
            </p>
            {canEdit && !searchQuery && selectedSection === 'all' && (
              <Link
                to="/panel/articles/new"
                className="inline-block mt-6 px-6 py-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-brand-primary)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <Plus size={20} className="inline mr-2" />
                Crear Artículo
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th className="px-6 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                      Artículo
                    </th>
                    <th className="px-6 py-4 text-left hidden lg:table-cell" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                      Sección
                    </th>
                    <th className="px-6 py-4 text-left hidden md:table-cell" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                      Autor
                    </th>
                    <th className="px-6 py-4 text-left hidden xl:table-cell" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left hidden sm:table-cell" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article, index) => (
                    <motion.tr
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ borderBottom: '1px solid #e5e7eb' }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h3
                              className="line-clamp-2 mb-1"
                              style={{ fontSize: '14px', fontWeight: 600 }}
                            >
                              {article.title}
                            </h3>
                            <p className="text-gray-500 text-xs">
                              {article.readTime} min lectura
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span
                          className="px-2 py-1 rounded text-xs capitalize"
                          style={{
                            backgroundColor: 'var(--color-brand-primary)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          {article.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p style={{ fontSize: '14px' }}>
                          {article.author}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <p className="text-gray-600" style={{ fontSize: '13px' }}>
                          {new Date(article.date).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {article.featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>
                            <CheckCircle size={14} />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>
                            <XCircle size={14} />
                            Borrador
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/noticia/${article._id}`}
                            target="_blank"
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Ver artículo"
                          >
                            <Eye size={18} />
                          </Link>
                          {canEdit && (
                            <>
                              <Link
                                to={`/panel/articles/edit/${article._id}`}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </Link>
                              {currentUser?.role === 'admin' && (
                                <button
                                  onClick={() => handleDelete(article._id, article.title)}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export const ArticleList: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="lector">
      <ArticleListContent />
    </ProtectedRoute>
  );
};
