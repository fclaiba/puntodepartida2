import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatsCard } from '../../components/admin/StatsCard';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  Activity,
  MessageCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';

const AdminDashboardContent: React.FC = () => {
  const { articles, analytics, users, comments, activityLog, currentUser } = useAdmin();
  
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const pendingComments = comments.filter(c => c.status === 'pending').length;

  const recentActivity = activityLog.slice(0, 5);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>
            Bienvenido/a {currentUser?.name} - {currentUser?.role.toUpperCase()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard
            icon={FileText}
            label="Total de Artículos"
            value={analytics.totalArticles}
            trend="+12%"
            trendUp={true}
            color="var(--color-brand-primary)"
          />
          <StatsCard
            icon={Eye}
            label="Vistas del Mes"
            value={analytics.viewsThisMonth.toLocaleString()}
            trend="+8.2%"
            trendUp={true}
            color="#F4A261"
          />
          <StatsCard
            icon={Users}
            label="Usuarios Total"
            value={users.length}
            color="var(--color-brand-secondary)"
          />
          <StatsCard
            icon={MessageCircle}
            label="Comentarios Pendientes"
            value={pendingComments}
            color="#E76F51"
            alert={pendingComments > 0}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatsCard
            icon={Calendar}
            label="Publicados Hoy"
            value={analytics.publishedToday}
            color="#2A9D8F"
          />
          <StatsCard
            icon={TrendingUp}
            label="Vistas de Hoy"
            value={analytics.viewsToday.toLocaleString()}
            color="#264653"
          />
          <StatsCard
            icon={Activity}
            label="Actividad Reciente"
            value={activityLog.length}
            color="#6B7280"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Articles */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                Artículos Recientes
              </h2>
              <Link
                to="/admin/articles"
                className="text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}
              >
                Ver todos
              </Link>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentArticles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-20" />
                  <p style={{ fontSize: '14px' }}>No hay artículos aún</p>
                  <Link
                    to="/admin/articles/new"
                    className="inline-block mt-4 px-4 py-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-brand-primary)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    Crear primer artículo
                  </Link>
                </div>
              ) : (
                recentArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ 
                              backgroundColor: 'var(--color-brand-primary)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          >
                            {article.section}
                          </span>
                        </div>
                        <h3 
                          className="mb-0.5 line-clamp-2"
                          style={{ fontSize: '14px', fontWeight: 600 }}
                        >
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-xs">
                          Por {article.author}
                        </p>
                      </div>
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="hidden sm:flex items-center px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors self-start text-xs"
                        style={{ fontWeight: 500 }}
                      >
                        Editar
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                Actividad Reciente
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Activity size={48} className="mx-auto mb-3 opacity-20" />
                  <p style={{ fontSize: '14px' }}>No hay actividad reciente</p>
                </div>
              ) : (
                recentActivity.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: log.type === 'article' 
                            ? 'var(--color-brand-primary)' 
                            : log.type === 'user'
                            ? 'var(--color-brand-secondary)'
                            : '#6B7280',
                          opacity: 0.1
                        }}
                      >
                        {log.type === 'article' && <FileText size={16} />}
                        {log.type === 'user' && <Users size={16} />}
                        {log.type === 'comment' && <MessageCircle size={16} />}
                        {log.type === 'settings' && <Activity size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', fontWeight: 600 }} className="mb-0.5">
                          {log.action}
                        </p>
                        <p className="text-gray-600 text-xs line-clamp-1">
                          {log.details}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {log.userName} • {new Date(log.timestamp).toLocaleDateString('es-AR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Link
            to="/admin/articles/new"
            className="p-6 bg-gradient-to-br from-[var(--color-brand-primary)] to-purple-700 rounded-xl text-white hover:scale-[1.02] transition-transform"
          >
            <FileText size={28} className="mb-3" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Nuevo Artículo
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              Publicar noticia
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="p-6 bg-gradient-to-br from-[var(--color-brand-secondary)] to-teal-700 rounded-xl text-white hover:scale-[1.02] transition-transform"
          >
            <Users size={28} className="mb-3" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Usuarios
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              Gestionar roles
            </p>
          </Link>

          <Link
            to="/admin/comments"
            className="p-6 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl text-white hover:scale-[1.02] transition-transform relative"
          >
            <MessageCircle size={28} className="mb-3" />
            {pendingComments > 0 && (
              <span className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {pendingComments}
              </span>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Comentarios
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              Moderar
            </p>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl text-white hover:scale-[1.02] transition-transform"
          >
            <BarChart3 size={28} className="mb-3" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Analytics
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              Ver estadísticas
            </p>
          </Link>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
};
