import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAdmin } from '../contexts/AdminContext';
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { LogOut, User, Settings, Bookmark, MessageSquare, ArrowLeft, Mail, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useConvexUpload } from '../hooks/useConvexUpload';
import { Id } from "@convex/_generated/dataModel";

export const UserProfilePage: React.FC = () => {
    const { currentUser, isGlobalLoading, logout } = useAdmin();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'bookmarks' | 'comments' | 'newsletter'>('info');

    const uploadFile = useConvexUpload();
    const getStorageUrl = useMutation(api.articles.getStorageUrl);
    const updateProfile = useMutation(api.users.updateProfile);

    const [isUploading, setIsUploading] = useState(false);
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [isSavingBio, setIsSavingBio] = useState(false);

    // Protected route logic
    React.useEffect(() => {
        if (!isGlobalLoading && !currentUser) {
            navigate('/auth');
        }
    }, [currentUser, isGlobalLoading, navigate]);

    // Tab Content Selectors
    const bookmarkedArticles = useQuery(api.bookmarks.getUserBookmarks, currentUser ? { userId: currentUser._id } : "skip");
    // const userComments = useQuery(api.comments.getUserComments, currentUser ? { userId: currentUser._id } : "skip");

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten imágenes');
            return;
        }

        setIsUploading(true);
        try {
            const storageId = await uploadFile(file);
            const url = await getStorageUrl({ storageId });

            if (url) {
                await updateProfile({
                    userId: currentUser._id,
                    avatarUrl: url
                });
                toast.success('Foto de perfil actualizada');
            }
        } catch (err) {
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBioSave = async () => {
        if (!currentUser) return;
        setIsSavingBio(true);
        try {
            await updateProfile({
                userId: currentUser._id,
                bio: bio.trim()
            });
            toast.success('Biografía actualizada');
        } catch (e) {
            toast.error('Error al guardar');
        } finally {
            setIsSavingBio(false);
        }
    };

    if (isGlobalLoading || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] dark:bg-gray-950 pb-20 transition-colors">
            {/* Header Profile Cover */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-5 lg:px-[60px] pt-8 pb-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-6 text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center shrink-0">
                                {currentUser.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-gray-400" />
                                )}
                            </div>

                            <label className="absolute bottom-0 right-0 p-2 md:p-3 bg-brand-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform disabled:opacity-50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera size={16} className="md:w-5 md:h-5" />
                                )}
                            </label>
                        </div>

                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-outfit">
                                {currentUser.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4 text-sm">
                                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                                    <Mail size={14} />
                                    {currentUser.email}
                                </span>
                                <span className="capitalize px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                    {currentUser.role}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex flex-row md:flex-col items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 md:p-3 rounded-lg transition-colors font-medium text-sm md:text-xs shrink-0 whitespace-nowrap"
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-5 lg:px-[60px] py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-8">
                            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`flex items-center gap-3 px-5 py-4 lg:py-4 border-b-2 lg:border-b-0 lg:border-l-2 text-sm font-medium transition-colors whitespace-nowrap w-full lg:w-auto text-left ${activeTab === 'info' ? 'border-brand-primary text-brand-primary bg-blue-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <User size={18} /> Mi Información
                                </button>
                                <button
                                    onClick={() => setActiveTab('bookmarks')}
                                    className={`flex items-center gap-3 px-5 py-4 lg:py-4 border-b-2 lg:border-b-0 lg:border-l-2 text-sm font-medium transition-colors whitespace-nowrap w-full lg:w-auto text-left ${activeTab === 'bookmarks' ? 'border-brand-primary text-brand-primary bg-blue-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Bookmark size={18} /> Artículos Guardados
                                </button>
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`flex items-center gap-3 px-5 py-4 lg:py-4 border-b-2 lg:border-b-0 lg:border-l-2 text-sm font-medium transition-colors whitespace-nowrap w-full lg:w-auto text-left opacity-50 cursor-not-allowed`}
                                    disabled
                                >
                                    <MessageSquare size={18} /> Mis Comentarios (Pronto)
                                </button>
                                <button
                                    onClick={() => setActiveTab('newsletter')}
                                    className={`flex items-center gap-3 px-5 py-4 lg:py-4 border-b-2 lg:border-b-0 lg:border-l-2 text-sm font-medium transition-colors whitespace-nowrap w-full lg:w-auto text-left opacity-50 cursor-not-allowed`}
                                    disabled
                                >
                                    <Settings size={18} /> Newsletter (Pronto)
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-grow">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 min-h-[400px]"
                        >
                            {/* TAB: INFO */}
                            {activeTab === 'info' && (
                                <div className="max-w-2xl">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-outfit">Información del Perfil</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                            <input
                                                type="text"
                                                disabled
                                                value={currentUser.name}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                disabled
                                                value={currentUser.email}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Biografía (Opcional)</label>
                                            <textarea
                                                rows={4}
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Cuéntanos un poco sobre ti..."
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none transition-all"
                                            />
                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    onClick={handleBioSave}
                                                    disabled={isSavingBio || bio === (currentUser.bio || '')}
                                                    className="px-5 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSavingBio ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: BOOKMARKS */}
                            {activeTab === 'bookmarks' && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-outfit">Artículos Guardados</h2>

                                    {bookmarkedArticles === undefined ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-primary rounded-full animate-spin"></div>
                                        </div>
                                    ) : bookmarkedArticles.length === 0 ? (
                                        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
                                            <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aún no tienes lecturas guardadas</h3>
                                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Cuando encuentres un artículo interesante, podés guardarlo para leerlo más tarde.</p>
                                            <Link to="/" className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
                                                Explorar Artículos
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookmarkedArticles.map((bookmark: any) => (
                                                <Link
                                                    key={bookmark._id}
                                                    to={`/noticias/${bookmark.article._id}`}
                                                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-primary/30 hover:shadow-md transition-all group bg-white"
                                                >
                                                    <div className="w-full sm:w-32 h-40 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                        <ImageWithFallback src={bookmark.article.imageUrl} alt={bookmark.article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{bookmark.article.section}</span>
                                                            <span className="text-xs text-gray-400">• {new Date(bookmark.article.date).toLocaleDateString('es-AR')}</span>
                                                        </div>
                                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                                                            {bookmark.article.title}
                                                        </h3>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
