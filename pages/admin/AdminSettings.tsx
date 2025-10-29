import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Save, Globe, Palette, Bell, Mail, BarChart } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';

const AdminSettingsContent: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useAdmin();
  const [formData, setFormData] = useState(siteSettings);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(formData);
    toast.success('Configuración guardada con éxito');
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '4px' }}>
            Configuración del Sitio
          </h1>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Personaliza la configuración general de PDP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(124, 52, 138, 0.1)' }}
              >
                <Globe size={20} style={{ color: 'var(--color-brand-primary)' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                Información General
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Email de Contacto
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Descripción del Sitio
                </label>
                <textarea
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 resize-none"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(124, 52, 138, 0.1)' }}
              >
                <Palette size={20} style={{ color: 'var(--color-brand-primary)' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                Apariencia
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Color Primario
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Color Secundario
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(124, 52, 138, 0.1)' }}
              >
                <Mail size={20} style={{ color: 'var(--color-brand-primary)' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                Redes Sociales
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/pdp"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Twitter URL
                </label>
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  placeholder="https://twitter.com/pdp"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/pdp"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  YouTube URL
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/pdp"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(124, 52, 138, 0.1)' }}
              >
                <Bell size={20} style={{ color: 'var(--color-brand-primary)' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                Configuración de Contenido
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Artículos por Página
                </label>
                <input
                  type="number"
                  name="articlesPerPage"
                  value={formData.articlesPerPage}
                  onChange={handleChange}
                  min="5"
                  max="50"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  name="googleAnalyticsId"
                  value={formData.googleAnalyticsId}
                  onChange={handleChange}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableComments"
                    checked={formData.enableComments}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      Habilitar Comentarios
                    </div>
                    <div className="text-gray-500 text-xs">
                      Permite a los lectores comentar en los artículos
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="moderateComments"
                    checked={formData.moderateComments}
                    onChange={handleChange}
                    disabled={!formData.enableComments}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] disabled:opacity-50"
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      Moderar Comentarios
                    </div>
                    <div className="text-gray-500 text-xs">
                      Requiere aprobación antes de publicar
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableNewsletter"
                    checked={formData.enableNewsletter}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>
                      Habilitar Newsletter
                    </div>
                    <div className="text-gray-500 text-xs">
                      Muestra el formulario de suscripción
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              style={{ 
                backgroundColor: 'var(--color-brand-primary)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </form>
      </motion.div>
    </AdminLayout>
  );
};

export const AdminSettings: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminSettingsContent />
    </ProtectedRoute>
  );
};
