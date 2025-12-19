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
  Timer,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const formatDuration = (seconds: number | null) => {
  if (seconds === null || !Number.isFinite(seconds)) {
    return 'Sin datos';
  }

  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
};

const AdminDashboardContent: React.FC = () => {
  const { articles, analytics, users, comments, activityLog, currentUser, isActivityLogLoading } = useAdmin();

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const pendingComments = comments.filter(c => c.status === 'pending').length;

  const recentActivity = activityLog.slice(0, 5);

  const monthlyViewGrowth = analytics.monthlyViewGrowth;
  const hasMonthlyGrowth =
    typeof monthlyViewGrowth === 'number' && Number.isFinite(monthlyViewGrowth);
  const monthlyTrend = hasMonthlyGrowth
    ? `${monthlyViewGrowth >= 0 ? '+' : ''}${monthlyViewGrowth.toFixed(1)}%`
    : null;

  const monthlyTrendUp = hasMonthlyGrowth && monthlyViewGrowth >= 0;

  const averageViewsPerArticle =
    analytics.totalArticles > 0 ? Math.round(analytics.totalViews / analytics.totalArticles) : 0;

  const uniqueReadersEstimate =
    analytics.viewsThisMonth > 0 ? Math.max(1, Math.round(analytics.viewsThisMonth * 0.6)) : 0;

  const uniqueReadersLabel =
    uniqueReadersEstimate > 0 ? uniqueReadersEstimate.toLocaleString() : 'Sin datos';

  const averageReadLabel = formatDuration(analytics.readingTime.averageSeconds);
  const completionRateLabel =
    analytics.readingTime.completionRate !== null
      ? `${analytics.readingTime.completionRate.toFixed(1)}%`
      : 'Sin datos';
  const readingSampleInsufficient =
    analytics.readingTime.sampleSize > 0 && analytics.readingTime.sampleSize < 5;

  const shareRateValue = analytics.shareMetrics.shareRate;
  const shareRateLabel =
    shareRateValue !== null ? `${shareRateValue.toFixed(1)}%` : 'Sin datos';
  const shareSampleInsufficient =
    (analytics.shareMetrics.sampleSize > 0 && analytics.shareMetrics.sampleSize < 10) ||
    (analytics.shareMetrics.totalShares > 0 && analytics.shareMetrics.totalShares < 3);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const formatDateTime = (isoDate: string) =>
    new Date(isoDate).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatsCard
            icon={FileText}
            label="Total de Artículos"
            value={analytics.totalArticles}
            color="var(--color-brand-primary)"
          />
          <StatsCard
            icon={Eye}
            label="Vistas del Mes"
            value={analytics.viewsThisMonth.toLocaleString()}
            trend={monthlyTrend ?? undefined}
            trendUp={monthlyTrend ? monthlyTrendUp : undefined}
            color="#F4A261"
          />
          <StatsCard
            icon={Users}
            label="Usuarios Totales"
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

        {analytics.viewsAreEstimated && (
          <div className="mb-8 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Aún no se registraron vistas reales en el sitio. Se muestran métricas estimadas basadas en los totales actuales.
          </div>
        )}

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
            icon={Users}
            label="Lectores únicos (estimado)"
            value={uniqueReadersLabel}
            color="#6B7280"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Últimos artículos</h2>
              <Link
                to="/panel/articles"
                className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
              >
                Ver todos
              </Link>
            </div>

            {recentArticles.length > 0 ? (
              <ul className="space-y-4">
                {recentArticles.map(article => (
                  <li key={article._id} className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-5 text-gray-900 line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(article.date)} · {article.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {(article.views ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">vistas</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                Todavía no hay artículos publicados. Crea el primero para comenzar a medir el rendimiento.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-[var(--color-brand-primary)]" />
                <h2 className="text-lg font-semibold">Actividad reciente</h2>
              </div>
              <Link
                to="/panel/activity"
                className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
              >
                Ver historial
              </Link>
            </div>

            {isActivityLogLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map(entry => (
                  <li key={entry.id} className="flex items-start gap-3">
                    <div
                      className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: 'var(--color-brand-primary)' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{entry.details}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(entry.timestamp)} · {entry.userName ?? 'Sistema'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                No se registró actividad todavía. Las acciones del equipo aparecerán aquí en cuanto se realicen.
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Promedio de vistas por artículo</p>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {averageViewsPerArticle.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Timer size={28} />
              <span className="text-sm uppercase tracking-wide">Tiempo de lectura medio</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {averageReadLabel}
            </p>
            <p className="text-xs opacity-80 mt-1">
              Completas: {completionRateLabel} · Sesiones: {analytics.readingTime.sampleSize.toLocaleString()}
            </p>
            {readingSampleInsufficient && (
              <p className="text-[11px] opacity-80 mt-2 italic">
                Muestra reducida: datos estimados.
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Share2 size={28} />
              <span className="text-sm uppercase tracking-wide">Share rate</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {shareRateLabel}
            </p>
            <p className="text-xs opacity-80 mt-1">
              Shares: {analytics.shareMetrics.totalShares.toLocaleString()} · Sesiones: {analytics.shareMetrics.sampleSize.toLocaleString()}
            </p>
            {shareSampleInsufficient && (
              <p className="text-[11px] opacity-80 mt-2 italic">
                Muestra limitada: interpretación cautelosa.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export const AdminDashboard = () => (
  <ProtectedRoute>
    <AdminDashboardContent />
  </ProtectedRoute>
);
