import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, MousePointerClick, Eye, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useConvexUpload } from '../../hooks/useConvexUpload';
import { Id } from '../../convex/_generated/dataModel';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

export const AdsManagerContent: React.FC = () => {
    const ads = useQuery(api.ads.getAll);
    const createAd = useMutation(api.ads.create);
    const updateAd = useMutation(api.ads.update);
    const removeAd = useMutation(api.ads.remove);
    const toggleActive = useMutation(api.ads.toggleActive);
    const getStorageUrl = useMutation(api.articles.getStorageUrl);
    const uploadFile = useConvexUpload();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<Id<"advertisements"> | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"advertisements"> | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        targetUrl: '',
        position: 'in-article' as 'hero' | 'sidebar' | 'in-article',
        active: true,
        imageUrl: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setFormData({
            title: '',
            targetUrl: '',
            position: 'in-article',
            active: true,
            imageUrl: ''
        });
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEdit = (ad: any) => {
        setFormData({
            title: ad.title,
            targetUrl: ad.targetUrl,
            position: ad.position,
            active: ad.active,
            imageUrl: ad.imageUrl
        });
        setPreviewUrl(ad.imageUrl);
        setEditingId(ad._id);
        setIsCreating(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!selectedFile && !formData.imageUrl) || !formData.title || !formData.targetUrl) {
            toast.error("Por favor completa los campos y sube una imagen");
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImageUrl = formData.imageUrl;

            if (selectedFile) {
                const storageId = await uploadFile(selectedFile);
                const url = await getStorageUrl({ storageId });
                if (url) finalImageUrl = url;
            }

            if (editingId) {
                await updateAd({
                    id: editingId,
                    ...formData,
                    imageUrl: finalImageUrl
                });
                toast.success('Anuncio actualizado');
            } else {
                await createAd({
                    ...formData,
                    imageUrl: finalImageUrl
                });
                toast.success('Anuncio creado');
            }

            setIsCreating(false);
            setEditingId(null);
            resetForm();
        } catch (error) {
            toast.error('Ocurrió un error al guardar el anuncio');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (ads === undefined) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-20"><LoadingSpinner /></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Publicidad & Banners</h1>
                    <p className="text-sm text-gray-500">Gestiona los banners publicitarios que aparecen en el sitio</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[var(--color-brand-primary)] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors"
                    >
                        <Plus size={18} /> Nuevo Anuncio
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
                    <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Anuncio' : 'Nuevo Anuncio'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre referencial *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-brand-primary)]"
                                    required
                                    placeholder="Ej: Campaña Invierno Banco Ciudad"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL de destino *</label>
                                <input
                                    type="url"
                                    value={formData.targetUrl}
                                    onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-brand-primary)]"
                                    required
                                    placeholder="https://"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Posición *</label>
                                <select
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-brand-primary)]"
                                >
                                    <option value="hero">Hero (Top Navbar)</option>
                                    <option value="sidebar">Sidebar (Cuadrado)</option>
                                    <option value="in-article">Dentro del artículo</option>
                                </select>
                            </div>
                            <div className="flex items-center mt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Activo inmediatamente</span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del banner (JPG, PNG) *</label>
                            <div className="flex gap-4 items-start">
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--color-brand-primary)] transition-colors cursor-pointer bg-gray-50 flex-1"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={handleFileChange}
                                    />
                                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-sm text-gray-600">
                                        {selectedFile ? selectedFile.name : formData.imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                                    </p>
                                </div>
                                {previewUrl && (
                                    <div className="w-1/3 min-w-[200px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                                        <img src={previewUrl} alt="Preview" loading="lazy" decoding="async" className="max-h-32 object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingId(null);
                                    resetForm();
                                }}
                                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-[var(--color-brand-primary)] text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar Anuncio' : 'Crear Anuncio'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Anuncio</th>
                            <th className="px-6 py-4 text-center">Posición</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 text-right">Impresiones / Clicks</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No hay anuncios cargados. Crea tu primer anuncio.
                                </td>
                            </tr>
                        ) : ads.map((ad: any) => (
                            <tr key={ad._id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                                            {ad.imageUrl ? (
                                                <img src={ad.imageUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{ad.title}</div>
                                            <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline max-w-[200px] truncate block">
                                                {ad.targetUrl}
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase
                                        ${ad.position === 'hero' ? 'bg-purple-50 text-purple-700' :
                                            ad.position === 'sidebar' ? 'bg-blue-50 text-blue-700' :
                                                'bg-amber-50 text-amber-700'}`}>
                                        {ad.position}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => toggleActive({ id: ad._id, active: !ad.active })}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${ad.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {ad.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {ad.active ? 'Activo' : 'Pausado'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-600" title="Impresiones (vistas)">
                                            <Eye size={14} />
                                            <span className="font-medium text-gray-900">{ad.impressions.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600" title="Clicks">
                                            <MousePointerClick size={14} />
                                            <span className="font-medium text-[var(--color-brand-primary)]">{ad.clicks.toLocaleString()}</span>
                                        </div>
                                        {ad.impressions > 0 && (
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="p-1.5 text-gray-500 hover:text-[var(--color-brand-primary)] hover:bg-purple-50 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(ad._id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Seguro que quieres eliminar este anuncio? Los datos de clicks e impresiones se perderán irrevocablemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (deleteConfirmId) {
                                removeAd({ id: deleteConfirmId });
                                toast.success("Anuncio eliminado");
                                setDeleteConfirmId(null);
                            }
                        }} className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export const AdsManager: React.FC = () => {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdsManagerContent />
        </ProtectedRoute>
    );
};
