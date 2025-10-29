import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Save, Eye, ArrowLeft, Image as ImageIcon, Calendar } from 'lucide-react';
import { NewsSection, NewsSections } from '../../data/newsData';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';

const ArticleEditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { articles, addArticle, updateArticle, currentUser } = useAdmin();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    section: 'politica' as NewsSection,
    author: currentUser?.name || '',
    readTime: 5,
    imageUrl: '',
    content: '',
    featured: false
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const article = articles.find(a => a.id === id);
      if (article) {
        setFormData({
          title: article.title,
          description: article.description || '',
          section: article.section,
          author: article.author,
          readTime: article.readTime,
          imageUrl: article.imageUrl,
          content: article.content,
          featured: article.featured || false
        });
      } else {
        toast.error('Artículo no encontrado');
        navigate('/admin/articles');
      }
    }
  }, [id, isEditing, articles, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'readTime' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }
    if (!formData.imageUrl.trim()) {
      toast.error('La URL de la imagen es obligatoria');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }
    if (formData.readTime < 1) {
      toast.error('El tiempo de lectura debe ser al menos 1 minuto');
      return;
    }

    try {
      if (isEditing && id) {
        updateArticle(id, formData);
        toast.success('Artículo actualizado con éxito');
      } else {
        addArticle(formData);
        toast.success('Artículo creado con éxito');
      }
      
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1000);
    } catch (error) {
      toast.error('Error al guardar el artículo');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/articles')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800 }}>
                {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h1>
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                {isEditing ? 'Modifica los detalles del artículo' : 'Crea un nuevo artículo para publicar'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <Eye size={18} />
              {showPreview ? 'Editar' : 'Vista Previa'}
            </button>
          </div>
        </div>

        {showPreview ? (
          /* Preview Mode */
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 lg:p-12">
            <div className="max-w-3xl mx-auto">
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt={formData.title}
                  className="w-full aspect-video object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
                  }}
                />
              )}
              
              <div className="mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-sm capitalize"
                  style={{ 
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  {formData.section}
                </span>
              </div>

              <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>
                {formData.title || 'Título del artículo'}
              </h1>

              <div className="flex items-center gap-4 mb-6 text-gray-600">
                <span style={{ fontSize: '14px' }}>
                  Por <strong>{formData.author || 'Autor'}</strong>
                </span>
                <span style={{ fontSize: '14px' }}>•</span>
                <span style={{ fontSize: '14px' }}>
                  {formData.readTime} min de lectura
                </span>
                <span style={{ fontSize: '14px' }}>•</span>
                <span style={{ fontSize: '14px' }}>
                  {new Date().toLocaleDateString('es-AR')}
                </span>
              </div>

              {formData.description && (
                <p 
                  className="mb-8"
                  style={{ 
                    fontSize: '18px', 
                    lineHeight: '1.7',
                    color: '#4b5563',
                    fontWeight: 500
                  }}
                >
                  {formData.description}
                </p>
              )}

              <div 
                className="prose max-w-none"
                style={{ fontSize: '16px', lineHeight: '1.8' }}
              >
                {formData.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full px-6 py-3 rounded-lg transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  Volver a editar
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <label 
                    htmlFor="title"
                    className="block mb-2"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Título del artículo *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                    placeholder="Escribe un título atractivo..."
                    required
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <label 
                    htmlFor="description"
                    className="block mb-2"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Descripción / Bajada *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all resize-none"
                    placeholder="Resume el artículo en 1-2 oraciones..."
                    required
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <label 
                    htmlFor="content"
                    className="block mb-2"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Contenido del artículo *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={20}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all resize-y"
                    placeholder="Escribe el contenido del artículo aquí... Usa saltos de línea para separar párrafos."
                    required
                    style={{ fontSize: '16px', lineHeight: '1.7' }}
                  />
                  <p className="mt-2 text-gray-500 text-xs">
                    {formData.content.length} caracteres
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>
                    Configuración
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label 
                        htmlFor="section"
                        className="block mb-2"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        Sección *
                      </label>
                      <select
                        id="section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                        required
                        style={{ fontSize: '16px' }}
                      >
                        <option value="politica">Política</option>
                        <option value="economia">Economía</option>
                        <option value="internacional">Internacional</option>
                        <option value="local">Local</option>
                        <option value="opinion">Opinión</option>
                      </select>
                    </div>

                    <div>
                      <label 
                        htmlFor="author"
                        className="block mb-2"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        Autor *
                      </label>
                      <input
                        id="author"
                        name="author"
                        type="text"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                        required
                        style={{ fontSize: '16px' }}
                      />
                    </div>

                    <div>
                      <label 
                        htmlFor="readTime"
                        className="block mb-2"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        Tiempo de lectura (minutos) *
                      </label>
                      <input
                        id="readTime"
                        name="readTime"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.readTime}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                        required
                        style={{ fontSize: '16px' }}
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>
                            Artículo destacado
                          </div>
                          <div className="text-gray-500 text-xs">
                            Publicar inmediatamente
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 700 }}>
                    Imagen destacada
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label 
                        htmlFor="imageUrl"
                        className="block mb-2"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        URL de la imagen *
                      </label>
                      <input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        required
                        style={{ fontSize: '14px' }}
                      />
                    </div>

                    {formData.imageUrl && (
                      <div>
                        <p className="text-gray-600 text-xs mb-2">Vista previa:</p>
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full aspect-video object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';
                          }}
                        />
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Tip:</strong> Usa imágenes de alta calidad (mínimo 1200x630px) para mejor visualización.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mb-3"
                    style={{ 
                      backgroundColor: 'var(--color-brand-primary)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    <Save size={20} />
                    {isEditing ? 'Actualizar Artículo' : 'Crear Artículo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/articles')}
                    className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export const ArticleEditor: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="editor">
      <ArticleEditorContent />
    </ProtectedRoute>
  );
};
