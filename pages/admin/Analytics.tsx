import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { TrendingUp, Eye, FileText, Users, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { StatsCard } from '../../components/admin/StatsCard';

const AnalyticsContent: React.FC = () => {
  const { analytics, articles } = useAdmin();

  const topArticles = [...articles]
    .sort((a, b) => (Math.random() - 0.5)) // Random para demo
    .slice(0, 10)
    .map((article, index) => ({
      ...article,
      views: Math.floor(Math.random() * 5000) + 1000
    }))
    .sort((a, b) => b.views - a.views);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '4px' }}>
            Analytics
          </h1>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Estadísticas y métricas del sitio
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard
            icon={Eye}
            label="Vistas Totales"
            value={analytics.totalViews.toLocaleString()}
            color="#F4A261"
          />
          <StatsCard
            icon={Eye}
            label="Vistas del Mes"
            value={analytics.viewsThisMonth.toLocaleString()}
            trend="+12.5%"
            trendUp={true}
            color="#2A9D8F"
          />
          <StatsCard
            icon={Eye}
            label="Vistas de la Semana"
            value={analytics.viewsThisWeek.toLocaleString()}
            trend="+8.3%"
            trendUp={true}
            color="#E76F51"
          />
          <StatsCard
            icon={Eye}
            label="Vistas de Hoy"
            value={analytics.viewsToday.toLocaleString()}
            color="#264653"
          />
        </div>

        {/* Views by Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="mb-6" style={{ fontSize: '20px', fontWeight: 700 }}>
            Vistas por Sección
          </h2>
          
          <div className="space-y-4">
            {Object.entries(analytics.viewsBySection)
              .sort(([, a], [, b]) => b - a)
              .map(([section, views], index) => {
                const maxViews = Math.max(...Object.values(analytics.viewsBySection));
                const percentage = (views / maxViews) * 100;
                
                return (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </span>
                      <span className="text-gray-600" style={{ fontSize: '14px' }}>
                        {views.toLocaleString()} vistas
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
              Artículos Más Vistos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th className="px-6 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                    #
                  </th>
                  <th className="px-6 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                    Artículo
                  </th>
                  <th className="px-6 py-4 text-left hidden md:table-cell" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                    Sección
                  </th>
                  <th className="px-6 py-4 text-right" style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                    Vistas
                  </th>
                </tr>
              </thead>
              <tbody>
                {topArticles.map((article, index) => (
                  <motion.tr
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: index < 3 ? 'var(--color-brand-primary)' : '#e5e7eb',
                          color: index < 3 ? 'white' : '#6b7280',
                          fontSize: '14px',
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 
                            className="line-clamp-1 mb-0.5"
                            style={{ fontSize: '14px', fontWeight: 600 }}
                          >
                            {article.title}
                          </h3>
                          <p className="text-gray-500 text-xs">
                            Por {article.author}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Eye size={16} className="text-gray-400" />
                        <span style={{ fontSize: '16px', fontWeight: 700 }}>
                          {article.views.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
            <BarChart3 size={32} className="mb-3 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Promedio de vistas por artículo</p>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {Math.floor(analytics.totalViews / analytics.totalArticles).toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
            <TrendingUp size={32} className="mb-3 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Crecimiento mensual</p>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              +12.5%
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
            <Users size={32} className="mb-3 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Lectores únicos</p>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {Math.floor(analytics.totalViews * 0.7).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export const Analytics: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="lector">
      <AnalyticsContent />
    </ProtectedRoute>
  );
};
