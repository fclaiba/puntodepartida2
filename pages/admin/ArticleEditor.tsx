import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Save, Eye, ArrowLeft, Upload, Link as LinkIcon, X } from 'lucide-react';
import { NewsSection } from '../../data/newsData';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useConvexUpload } from '../../hooks/useConvexUpload';

const ArticleEditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAdmin();
  const isEditing = !!id;

  // Convex hooks
  const article = useQuery(api.articles.getById, isEditing ? { id: id as Id<"articles"> } : "skip");
  const create = useMutation(api.articles.create);
  const update = useMutation(api.articles.update);
  const uploadFile = useConvexUpload();

  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (isEditing && article) {
      setFormData({
        title: article.title,
        description: article.description || '',
        section: article.section as NewsSection,
        author: article.author,
        readTime: article.readTime,
        imageUrl: article.imageUrl,
        content: article.content,
        featured: article.featured || false
      });
      setPreviewUrl(article.imageUrl);
      if (article.storageId) {
        setImageSource('upload');
      }
    } else if (isEditing && article === null) {
      toast.error('Artículo no encontrado');
      navigate('/panel/articles');
    }
  }, [isEditing, article, navigate]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side validation
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos JPG, JPEG o PNG');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('El archivo no debe superar los 5MB');
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = objectUrl;
      setImageSource('upload');
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedContent = formData.content.trim();
    const trimmedAuthor = formData.author.trim();
    const trimmedImageUrl = formData.imageUrl.trim();

    if (!trimmedTitle) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!trimmedDescription) {
      toast.error('La descripción es obligatoria');
      return;
    }
    if (imageSource === 'url' && !trimmedImageUrl) {
      toast.error('La URL de la imagen es obligatoria');
      return;
    }
    if (imageSource === 'upload' && !selectedFile && !isEditing) {
      toast.error('Debes subir una imagen');
      return;
    }
    if (!trimmedContent) {
      toast.error('El contenido es obligatorio');
      return;
    }
    if (formData.readTime < 1) {
      toast.error('El tiempo de lectura debe ser al menos 1 minuto');
      return;
    }

    setIsSubmitting(true);

    try {
      let storageId: Id<"_storage"> | undefined;

      if (imageSource === 'upload' && selectedFile) {
        try {
          storageId = await uploadFile(selectedFile);
        } catch (uploadError) {
          const message = uploadError instanceof Error ? uploadError.message : 'No se pudo subir la imagen';
          setSubmitError(message);
          toast.error(message);
          return;
        }
      }

      if (!isEditing && imageSource === 'upload' && !storageId) {
        toast.error('Debes subir una imagen válida');
        return;
      }

      if (isEditing && id) {
        const updatePayload: Parameters<typeof update>[0] = {
          id: id as Id<"articles">,
          title: trimmedTitle,
          description: trimmedDescription,
          section: formData.section,
          author: trimmedAuthor,
          readTime: formData.readTime,
          content: trimmedContent,
          featured: formData.featured,
          ...(imageSource === 'url' ? { imageUrl: trimmedImageUrl } : {}),
          ...(storageId ? { storageId } : {}),
        };

        await update(updatePayload);
        toast.success('Artículo actualizado con éxito');
      } else {
        const createPayload: Parameters<typeof create>[0] = {
          title: trimmedTitle,
          description: trimmedDescription,
          section: formData.section,
          author: trimmedAuthor,
          readTime: formData.readTime,
          content: trimmedContent,
          featured: formData.featured,
          imageUrl: imageSource === 'url' ? trimmedImageUrl : '',
          ...(storageId ? { storageId } : {}),
        };

        await create(createPayload);
        toast.success('Artículo creado con éxito');
      }

      if (imageSource === 'upload' && objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      setTimeout(() => {
        navigate('/panel/articles');
      }, 1000);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Error al guardar el artículo';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

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
              onClick={() => navigate('/panel/articles')}
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
              {previewUrl && (
                <img
                  src={previewUrl}
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
            {submitError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {submitError}
              </div>
            )}
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

                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setImageSource('upload');
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${imageSource === 'upload'
                        ? 'bg-[var(--color-brand-primary)] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Upload size={16} />
                      Subir archivo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageSource('url');
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                        if (objectUrlRef.current) {
                          URL.revokeObjectURL(objectUrlRef.current);
                          objectUrlRef.current = null;
                        }
                        setPreviewUrl(formData.imageUrl);
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${imageSource === 'url'
                        ? 'bg-[var(--color-brand-primary)] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <LinkIcon size={16} />
                      Enlace URL
                    </button>
                  </div>

                  <div className="space-y-4">
                    {imageSource === 'url' ? (
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
                          onChange={(e) => {
                            handleChange(e);
                            setPreviewUrl(e.target.value);
                          }}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          required={imageSource === 'url'}
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                    ) : (
                      <div>
                        <label
                          className="block mb-2"
                          style={{ fontSize: '14px', fontWeight: 600 }}
                        >
                          Subir imagen (JPG, PNG) *
                        </label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--color-brand-primary)] transition-colors cursor-pointer bg-gray-50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileChange}
                          />
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="text-gray-400" size={32} />
                            <p className="text-sm text-gray-600">
                              {selectedFile ? selectedFile.name : 'Haz clic para seleccionar una imagen'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Máximo 5MB
                            </p>
                          </div>
                        </div>
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setPreviewUrl('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                              if (objectUrlRef.current) {
                                URL.revokeObjectURL(objectUrlRef.current);
                                objectUrlRef.current = null;
                              }
                            }}
                            className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <X size={12} /> Eliminar selección
                          </button>
                        )}
                      </div>
                    )}

                    {previewUrl && (
                      <div>
                        <p className="text-gray-600 text-xs mb-2">Vista previa:</p>
                        <img
                          src={previewUrl}
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
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mb-3"
                    style={{
                      backgroundColor: 'var(--color-brand-primary)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 600,
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    <Save size={20} />
                    {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Artículo' : 'Crear Artículo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/panel/articles')}
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
