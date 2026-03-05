import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Save, Eye, ArrowLeft, Upload, Link as LinkIcon, X, Check } from 'lucide-react';
import { NewsSection } from '../../data/newsData';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useConvexUpload } from '../../hooks/useConvexUpload';
import { GripVertical, Plus, Trash2, Image as ImageIcon, Type, Link2, Globe, Bell } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

export type ArticleBlockType = 'text' | 'image' | 'embed';

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  content: string; // text content, image URL, or embed URL
  metadata?: {
    caption?: string;    // bajada para imágenes
    format?: 'bold' | 'italic' | 'underline' | 'normal'; // formato actual para texto, simplificado
  };
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const ArticleEditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAdmin();
  const isEditing = !!id;

  // Convex hooks
  const article = useQuery(api.articles.getById, isEditing ? { id: id as Id<"articles"> } : "skip");
  const create = useMutation(api.articles.create);
  const update = useMutation(api.articles.update);
  const broadcastPush = useMutation(api.notifications.broadcastNotification);
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
    authorBio: '',
    readTime: 5,
    imageUrl: '',
    content: '[]', // We will store the blocks as a JSON string
    featured: false,
    status: 'published' as 'draft' | 'scheduled' | 'published',
    publishDate: '',
    isPremium: false,
    metaTitle: '',
    metaDescription: '',
    ogImage: ''
  });

  const [blocks, setBlocks] = useState<ArticleBlock[]>([
    { id: crypto.randomUUID(), type: 'text', content: '' }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  // Per-block image upload state
  const [blockImageModes, setBlockImageModes] = useState<Record<string, 'url' | 'upload'>>({});
  const [blockUploading, setBlockUploading] = useState<Record<string, boolean>>({});
  const blockFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const getStorageUrl = useMutation(api.articles.getStorageUrl);

  const handleBlockFileUpload = async (blockId: string, file: File) => {
    // Client-side validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos JPG, PNG o WebP');
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('El archivo no debe superar los 5MB');
      return;
    }

    // Show local preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content: localPreviewUrl } : b));
    setBlockUploading(prev => ({ ...prev, [blockId]: true }));

    try {
      // Upload to Convex storage
      const storageId = await uploadFile(file);
      // Get the permanent public URL
      const publicUrl = await getStorageUrl({ storageId });
      if (publicUrl) {
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content: publicUrl } : b));
      }
      URL.revokeObjectURL(localPreviewUrl);
      toast.success('Imagen subida correctamente');
    } catch (err) {
      console.error('Error uploading block image:', err);
      toast.error('Error al subir la imagen');
      // Revert to empty
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content: '' } : b));
      URL.revokeObjectURL(localPreviewUrl);
    } finally {
      setBlockUploading(prev => ({ ...prev, [blockId]: false }));
    }
  };

  useEffect(() => {
    if (isEditing && article) {
      setFormData({
        title: article.title,
        description: article.description || '',
        section: article.section as NewsSection,
        author: article.author,
        authorBio: article.authorBio || '',
        readTime: article.readTime,
        imageUrl: article.imageUrl,
        content: article.content,
        featured: article.featured || false,
        status: (article.status as 'draft' | 'scheduled' | 'published') || 'published',
        publishDate: article.publishDate || '',
        isPremium: article.isPremium || false,
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || '',
        ogImage: article.ogImage || ''
      });
      setPreviewUrl(article.imageUrl);

      // Parse blocks
      try {
        const parsedBlocks = JSON.parse(article.content);
        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
          // Set image blocks with existing URLs to "url" mode
          const modes: Record<string, 'url' | 'upload'> = {};
          parsedBlocks.forEach((b: ArticleBlock) => {
            if (b.type === 'image' && b.content) {
              modes[b.id] = 'url';
            }
          });
          setBlockImageModes(modes);
        } else {
          // Fallback if content was not blocks
          setBlocks([{ id: crypto.randomUUID(), type: 'text', content: article.content }]);
        }
      } catch (e) {
        // Fallback if plain text
        setBlocks([{ id: crypto.randomUUID(), type: 'text', content: article.content }]);
      }
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

  // Autosave Draft
  useEffect(() => {
    if (!isEditing || !id || isSubmitting) return;

    const timeoutId = setTimeout(async () => {
      // Don't autosave if image is still uploading
      const stillUploading = Object.values(blockUploading).some(v => v);
      if (stillUploading) return;

      const trimmedTitle = formData.title.trim();
      if (!trimmedTitle) return; // Need at least a title

      setSaveStatus('saving');
      try {
        const blocksJson = JSON.stringify(blocks);
        const updatePayload: Parameters<typeof update>[0] = {
          id: id as Id<"articles">,
          title: trimmedTitle,
          description: formData.description.trim(),
          section: formData.section,
          author: formData.author.trim(),
          ...(formData.authorBio.trim() ? { authorBio: formData.authorBio.trim() } : {}),
          readTime: formData.readTime,
          content: blocksJson,
          featured: formData.featured,
          status: formData.status,
          isPremium: formData.isPremium,
          ...(formData.publishDate ? { publishDate: formData.publishDate } : {}),
          ...(formData.metaTitle ? { metaTitle: formData.metaTitle } : {}),
          ...(formData.metaDescription ? { metaDescription: formData.metaDescription } : {}),
          ...(formData.ogImage ? { ogImage: formData.ogImage } : {}),
        };

        await update(updatePayload);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error("Autosave error:", error);
        setSaveStatus('idle');
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [formData, blocks, isEditing, id, isSubmitting, blockUploading, update]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedAuthor = formData.author.trim();
    const trimmedAuthorBio = formData.authorBio.trim();
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

    // Check if any block images are still uploading
    const stillUploading = Object.values(blockUploading).some(v => v);
    if (stillUploading) {
      toast.error('Esperá a que terminen de subirse las imágenes.');
      return;
    }

    // Ensure all blocks have their content
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const invalidBlock = blocks.find(b => {
      if (b.type === 'text') return !stripHtml(b.content);
      if (b.type === 'image') return !b.content.trim() || b.content.startsWith('blob:');
      return !b.content.trim();
    });
    if (invalidBlock) {
      if (invalidBlock.type === 'image' && invalidBlock.content.startsWith('blob:')) {
        toast.error('Una imagen todavía se está subiendo. Esperá un momento.');
      } else {
        toast.error('Todos los bloques de contenido deben estar completos.');
      }
      return;
    }

    const blocksJson = JSON.stringify(blocks);

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
          ...(trimmedAuthorBio ? { authorBio: trimmedAuthorBio } : {}),
          readTime: formData.readTime,
          content: blocksJson,
          featured: formData.featured,
          status: formData.status,
          isPremium: formData.isPremium,
          ...(formData.publishDate ? { publishDate: formData.publishDate } : {}),
          ...(formData.metaTitle ? { metaTitle: formData.metaTitle } : {}),
          ...(formData.metaDescription ? { metaDescription: formData.metaDescription } : {}),
          ...(formData.ogImage ? { ogImage: formData.ogImage } : {}),
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
          ...(trimmedAuthorBio ? { authorBio: trimmedAuthorBio } : {}),
          readTime: formData.readTime,
          content: blocksJson,
          featured: formData.featured,
          status: formData.status,
          isPremium: formData.isPremium,
          ...(formData.publishDate ? { publishDate: formData.publishDate } : {}),
          ...(formData.metaTitle ? { metaTitle: formData.metaTitle } : {}),
          ...(formData.metaDescription ? { metaDescription: formData.metaDescription } : {}),
          ...(formData.ogImage ? { ogImage: formData.ogImage } : {}),
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

  const handleSendPush = async () => {
    if (!formData.title || !formData.description) {
      toast.error('El artículo debe tener título y bajada para ser enviado por Push.');
      return;
    }

    setIsPushConfirmOpen(true);
  };

  const confirmSendPush = async () => {
    setIsPushConfirmOpen(false);
    try {
      const result = await broadcastPush({
        title: '📰 ' + formData.title,
        body: formData.description,
        url: isEditing ? `/noticia/${id}` : '/', // Fallback to index if drafting
        icon: formData.imageUrl || undefined
      });

      if (result && result.success) {
        toast.success(`Notificación enviada a ${result.count} suscriptores.`);
      } else {
        toast.error(result?.error || 'Falló el envío de notificaciones.');
      }
    } catch (err) {
      toast.error('Ocurrió un error al enviar las notificaciones.');
      console.error(err);
    }
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
              onClick={() => navigate('/panel/articles')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800 }}>
                  {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h1>
                {saveStatus === 'saving' && <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1"><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Guardando...</span>}
                {saveStatus === 'saved' && <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded flex items-center gap-1"><Check size={14} /> Guardado</span>}
              </div>
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

              <div className="prose max-w-none" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                {blocks.map((block) => {
                  if (!block.content.trim() && block.type !== 'image') return null;

                  switch (block.type) {
                    case 'text':
                      let formattedText = block.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ));

                      if (block.metadata?.format === 'bold') {
                        formattedText = [(<strong key="strong">{formattedText}</strong>)];
                      } else if (block.metadata?.format === 'italic') {
                        formattedText = [(<em key="em">{formattedText}</em>)];
                      } else if (block.metadata?.format === 'underline') {
                        formattedText = [(<u key="u">{formattedText}</u>)];
                      }

                      return <div key={block.id}>{formattedText}</div>;

                    case 'image':
                      if (!block.content) return null;
                      return (
                        <figure key={block.id} className="my-8">
                          <img
                            src={block.content}
                            alt={block.metadata?.caption || 'Imagen del artículo'}
                            className="w-full rounded-xl"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          {block.metadata?.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                              {block.metadata.caption}
                            </figcaption>
                          )}
                        </figure>
                      );

                    case 'embed':
                      if (!block.content) return null;
                      const isTwitter = block.content.includes('twitter.com') || block.content.includes('x.com');
                      const isInstagram = block.content.includes('instagram.com');

                      return (
                        <div key={block.id} className="my-8 flex justify-center w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4">
                          {isTwitter ? (
                            <div className="w-full max-w-sm flex items-center justify-center p-4">
                              <span className="text-blue-500 font-bold border rounded px-4 py-2 border-blue-200 bg-blue-50 text-sm flex gap-2"><Link2 size={16} /> Ver Tweet Original en X</span>
                            </div>
                          ) : isInstagram ? (
                            <div className="w-full max-w-sm flex items-center justify-center p-4">
                              <span className="text-pink-600 font-bold border rounded px-4 py-2 border-pink-200 bg-pink-50 text-sm flex gap-2"><Link2 size={16} /> Ver Post Original en Instagram</span>
                            </div>
                          ) : (
                            <a href={block.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium">
                              <Link2 size={16} /> Ver contenido externo
                            </a>
                          )}
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
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

                {/* Content Blocks */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <label
                      className="block"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      Contenido del artículo (Bloques) *
                    </label>
                  </div>

                  <div className="space-y-6">
                    {blocks.map((block, index) => (
                      <div key={block.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative group">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <GripVertical className="text-gray-400 cursor-move" size={16} />
                            <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {block.type === 'text' && 'Texto'}
                              {block.type === 'image' && 'Imagen'}
                              {block.type === 'embed' && 'Embed Social'}
                            </span>
                          </div>
                          {blocks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...blocks];
                                newBlocks.splice(index, 1);
                                setBlocks(newBlocks);
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        {/* Text Block Content */}
                        {block.type === 'text' && (
                          <div className="space-y-2 relative bg-white rounded-lg border border-gray-300">
                            <ReactQuill
                              theme="snow"
                              value={block.content}
                              onChange={(content) => {
                                const newBlocks = [...blocks];
                                newBlocks[index].content = content;
                                setBlocks(newBlocks);
                              }}
                              modules={modules}
                              placeholder="Escribe el párrafo aquí..."
                              className="w-full text-base"
                            />
                          </div>
                        )}

                        {/* Image Block Content */}
                        {block.type === 'image' && (() => {
                          const mode = blockImageModes[block.id] || 'upload';
                          const isUploading = blockUploading[block.id] || false;
                          return (
                            <div className="space-y-3">
                              {/* Mode selector */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setBlockImageModes(prev => ({ ...prev, [block.id]: 'upload' }))}
                                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === 'upload'
                                    ? 'bg-[var(--color-brand-primary)] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                  <Upload size={14} />
                                  Subir archivo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBlockImageModes(prev => ({ ...prev, [block.id]: 'url' }))}
                                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${mode === 'url'
                                    ? 'bg-[var(--color-brand-primary)] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                  <LinkIcon size={14} />
                                  Enlace URL
                                </button>
                              </div>

                              {mode === 'url' ? (
                                <input
                                  type="text"
                                  value={block.content.startsWith('blob:') ? '' : block.content}
                                  onChange={(e) => {
                                    const newBlocks = [...blocks];
                                    newBlocks[index].content = e.target.value;
                                    setBlocks(newBlocks);
                                  }}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)]"
                                  placeholder="URL de la imagen (ej: https://...)"
                                />
                              ) : (
                                <div>
                                  <div
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer bg-gray-50 ${isUploading ? 'border-gray-200 opacity-60 pointer-events-none' : 'border-gray-300 hover:border-[var(--color-brand-primary)]'}`}
                                    onClick={() => blockFileInputRefs.current[block.id]?.click()}
                                  >
                                    <input
                                      type="file"
                                      ref={(el) => { blockFileInputRefs.current[block.id] = el; }}
                                      className="hidden"
                                      accept="image/jpeg,image/png,image/jpg,image/webp"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleBlockFileUpload(block.id, file);
                                        }
                                        e.target.value = '';
                                      }}
                                    />
                                    <div className="flex flex-col items-center gap-1.5">
                                      {isUploading ? (
                                        <>
                                          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent animate-spin" />
                                          <p className="text-xs text-gray-500">Subiendo imagen...</p>
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="text-gray-400" size={24} />
                                          <p className="text-xs text-gray-600">
                                            {block.content && !block.content.startsWith('blob:') ? 'Clic para cambiar la imagen' : 'Clic para seleccionar una imagen'}
                                          </p>
                                          <p className="text-xs text-gray-400">JPG, PNG o WebP — Máximo 5MB</p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {block.content && !block.content.startsWith('blob:') && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newBlocks = [...blocks];
                                        newBlocks[index].content = '';
                                        setBlocks(newBlocks);
                                      }}
                                      className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                      <X size={12} /> Eliminar imagen
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Preview */}
                              {block.content && (
                                <div className="mt-2 rounded overflow-hidden aspect-video bg-gray-100 flex items-center justify-center">
                                  <img src={block.content} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                              )}

                              {/* Caption */}
                              <input
                                type="text"
                                value={block.metadata?.caption || ''}
                                onChange={(e) => {
                                  const newBlocks = [...blocks];
                                  newBlocks[index].metadata = { ...newBlocks[index].metadata, caption: e.target.value };
                                  setBlocks(newBlocks);
                                }}
                                className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 outline-none focus:border-gray-400"
                                placeholder="Epígrafe o bajada de la foto (opcional)"
                              />
                            </div>
                          );
                        })()}

                        {/* Embed Block Content */}
                        {block.type === 'embed' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={block.content}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[index].content = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)]"
                              placeholder="Pega la URL del Tweet o posteo de Instagram aquí..."
                            />
                            <p className="text-xs text-gray-500">
                              Al guardar o en la vista previa, el frame se cargará automáticamente.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Block Menu */}
                  <div className="mt-6 flex justify-center gap-2 border-t border-dashed border-gray-300 pt-6">
                    <button
                      type="button"
                      onClick={() => setBlocks([...blocks, { id: crypto.randomUUID(), type: 'text', content: '' }])}
                      className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Type size={16} /> + Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlocks([...blocks, { id: crypto.randomUUID(), type: 'image', content: '' }])}
                      className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <ImageIcon size={16} /> + Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlocks([...blocks, { id: crypto.randomUUID(), type: 'embed', content: '' }])}
                      className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Link2 size={16} /> + Embed Social
                    </button>
                  </div>
                  <p className="mt-4 text-gray-500 text-xs text-center">
                    {blocks.length} bloque(s) añadidos.
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
                        htmlFor="authorBio"
                        className="block mb-2"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        Biografía del autor
                      </label>
                      <textarea
                        id="authorBio"
                        name="authorBio"
                        value={formData.authorBio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all resize-none"
                        placeholder="Breve biografía del autor (opcional)..."
                        style={{ fontSize: '14px' }}
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
                      <label className="flex items-center gap-3 cursor-pointer mb-4">
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
                            Aparecerá fijado en la página principal
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer mb-6">
                        <input
                          type="checkbox"
                          name="isPremium"
                          checked={formData.isPremium}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>
                            Contenido Premium
                          </div>
                          <div className="text-gray-500 text-xs">
                            Requiere estar registrado para leerlo completo
                          </div>
                        </div>
                      </label>

                      <div className="mb-4">
                        <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                          Estado de publicación
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                          style={{ fontSize: '14px' }}
                        >
                          <option value="draft">Borrador</option>
                          <option value="published">Publicado</option>
                          <option value="scheduled">Programado</option>
                        </select>
                      </div>

                      {formData.status === 'scheduled' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block mb-2 text-[var(--color-brand-primary)]" style={{ fontSize: '14px', fontWeight: 600 }}>
                            Fecha y Hora de programación *
                          </label>
                          <input
                            type="datetime-local"
                            name="publishDate"
                            value={formData.publishDate}
                            onChange={handleChange}
                            required={formData.status === 'scheduled'}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--color-brand-primary)]/50 bg-[var(--color-brand-primary)]/5 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                            style={{ fontSize: '14px' }}
                          />
                          <p className="text-xs text-[var(--color-brand-primary)]/70 mt-2">
                            El artículo se publicará automáticamente en esta fecha.
                          </p>
                        </div>
                      )}
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

                {/* Advanced SEO */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 700 }}>
                    <Globe size={18} className="text-[var(--color-brand-primary)]" />
                    Optimización SEO
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="metaTitle" className="block mb-2 text-sm font-medium text-gray-700">
                        Meta Título (opcional)
                      </label>
                      <input
                        id="metaTitle"
                        name="metaTitle"
                        type="text"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] text-sm"
                        placeholder="Título para Google (Max 60 chars)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">Si está vacío, se usará el título del artículo.</p>
                    </div>

                    <div>
                      <label htmlFor="metaDescription" className="block mb-2 text-sm font-medium text-gray-700">
                        Meta Descripción (opcional)
                      </label>
                      <textarea
                        id="metaDescription"
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] text-sm resize-none"
                        placeholder="Resumen atractivo para buscadores..."
                        maxLength={160}
                      />
                      <p className={`text-xs mt-1 ${formData.metaDescription.length > 150 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {formData.metaDescription.length}/160 caracteres
                      </p>
                    </div>

                    <div>
                      <label htmlFor="ogImage" className="block mb-2 text-sm font-medium text-gray-700">
                        Imagen Social (og:image) (opcional)
                      </label>
                      <input
                        id="ogImage"
                        name="ogImage"
                        type="url"
                        value={formData.ogImage}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] text-sm"
                        placeholder="https://ejemplo.com/social-preview.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">Sino, se utilizará la imagen principal.</p>
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
                    className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors mb-3"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Cancelar
                  </button>

                  {/* Notificación Push Action */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleSendPush}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition-all font-medium border border-yellow-200"
                    >
                      <Bell size={18} />
                      Enviar Alerta Push
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </motion.div>

      <AlertDialog open={isPushConfirmOpen} onOpenChange={setIsPushConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar Alerta Push</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas enviar una notificación Push a todos los suscriptores? Esto enviará un mensaje directo e inmediato a los navegadores de todos los lectores registrados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendPush} className="bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-600">
              Enviar Notificación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
