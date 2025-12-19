import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  TrendingUp,
  Eye,
  FileText,
  BarChart3,
  PieChart,
  Timer,
  Share2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { StatsCard } from '../../components/admin/StatsCard';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import type {
  ReaderDistribution,
  ReadingTimeStats,
  ShareMetrics,
} from '../../contexts/AdminContext';

const sanitizeNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const sanitizePercent = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const sanitizeNullableNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const sanitizeRecord = (value: unknown): Record<string, number> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, number>)
    : {};

const sanitizeViewsByDay = (
  value: unknown
): Array<{ date: string; views: number }> =>
  Array.isArray(value)
    ? value
        .map((entry) => ({
          date: typeof entry?.date === 'string' ? entry.date : '',
          views: sanitizeNumber((entry as { views?: unknown })?.views),
        }))
        .filter((entry) => Boolean(entry.date))
    : [];

const sanitizeTopArticles = (
  value: unknown
): Array<{ id: string; title: string; views: number }> =>
  Array.isArray(value)
    ? value.map((article, index) => {
        const record = article as { id?: unknown; title?: unknown; views?: unknown };
        return {
          id:
            typeof record?.id === 'string' && record.id.length > 0
              ? record.id
              : `article-${index}`,
          title:
            typeof record?.title === 'string' && record.title.length > 0
              ? record.title
              : 'Artículo sin título',
          views: sanitizeNumber(record?.views),
        };
      })
    : [];

const sanitizeShareChannels = (
  value: unknown
): Array<{ channel: string; count: number }> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry, index) => {
    const record = entry as { channel?: unknown; count?: unknown };
    const channel =
      typeof record.channel === 'string' && record.channel.length > 0
        ? record.channel
        : `Canal ${index + 1}`;

    return {
      channel,
      count: sanitizeNumber(record.count),
    };
  });
};

const sanitizeReaderDistribution = (value: unknown): ReaderDistribution => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Partial<ReaderDistribution>;
    return {
      guest: sanitizeNumber(record.guest),
      registered: sanitizeNumber(record.registered),
      total: sanitizeNumber(record.total),
      sampleSize: sanitizeNumber(record.sampleSize),
      windowDays: sanitizeNumber(record.windowDays) || 30,
    };
  }

  return {
    guest: 0,
    registered: 0,
    total: 0,
    sampleSize: 0,
    windowDays: 30,
  };
};

const sanitizeReadingTime = (value: unknown): ReadingTimeStats => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Partial<ReadingTimeStats>;
    return {
      averageSeconds: sanitizeNullableNumber(record.averageSeconds),
      medianSeconds: sanitizeNullableNumber(record.medianSeconds),
      p90Seconds: sanitizeNullableNumber(record.p90Seconds),
      completionRate: sanitizePercent(record.completionRate),
      sampleSize: sanitizeNumber(record.sampleSize),
      windowDays: sanitizeNumber(record.windowDays) || 30,
    };
  }

  return {
    averageSeconds: null,
    medianSeconds: null,
    p90Seconds: null,
    completionRate: null,
    sampleSize: 0,
    windowDays: 30,
  };
};

const sanitizeShareMetrics = (value: unknown): ShareMetrics => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Partial<ShareMetrics> & { channels?: unknown };
    return {
      totalShares: sanitizeNumber(record.totalShares),
      shareRate: sanitizePercent(record.shareRate),
      sampleSize: sanitizeNumber(record.sampleSize),
      windowDays: sanitizeNumber(record.windowDays) || 30,
      channels: sanitizeShareChannels(record.channels),
    };
  }

  return {
    totalShares: 0,
    shareRate: null,
    sampleSize: 0,
    windowDays: 30,
    channels: [],
  };
};

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

const formatPercentLabel = (value: number | null, digits: number = 1) => {
  if (value === null || !Number.isFinite(value)) {
    return 'Sin datos';
  }
  return `${value >= 0 ? value.toFixed(digits) : value.toFixed(digits)}%`;
};

const MIN_CONFIDENT_SESSION_SAMPLE = 10;
const MIN_READING_SAMPLE = 5;
const MIN_SHARE_EVENTS = 3;

const AnalyticsContent: React.FC = () => {
  const stats = useQuery(api.analytics.getDashboardStats);
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d'>('30d');
  const isLoading = stats === undefined;

  const totalViews = sanitizeNumber(stats?.totalViews);
  const viewsThisMonth = sanitizeNumber(stats?.viewsThisMonth);
  const viewsThisWeek = sanitizeNumber(stats?.viewsThisWeek);
  const totalArticles = sanitizeNumber(stats?.totalArticles);
  const monthlyViewGrowth = sanitizePercent(stats?.monthlyViewGrowth);
  const viewsAreEstimated = Boolean(stats?.viewsAreEstimated);

  const viewsBySection = sanitizeRecord(stats?.viewsBySection);
  const topArticles = sanitizeTopArticles(stats?.topArticles ?? []);
  const viewsByDay = sanitizeViewsByDay(stats?.viewsByDay ?? []);
  const readerDistribution = sanitizeReaderDistribution(stats?.readerDistribution);
  const readingTime = sanitizeReadingTime(stats?.readingTime);
  const shareMetrics = sanitizeShareMetrics(stats?.shareMetrics);

  const viewsToday = sanitizeNumber(stats?.viewsToday);
  const hasMonthlyGrowth = monthlyViewGrowth !== null;
  const monthlyTrend = hasMonthlyGrowth
    ? `${monthlyViewGrowth! >= 0 ? '+' : ''}${monthlyViewGrowth!.toFixed(1)}%`
    : null;
  const monthlyTrendUp = hasMonthlyGrowth && (monthlyViewGrowth ?? 0) >= 0;

  const averageViewsPerArticle =
    totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

  const uniqueReadersEstimate =
    viewsThisMonth > 0 ? Math.max(1, Math.round(viewsThisMonth * 0.6)) : 0;
  const uniqueReadersLabel =
    uniqueReadersEstimate > 0 ? uniqueReadersEstimate.toLocaleString() : 'Sin datos';

  const lastSevenDays = viewsByDay.slice(-7);
  const previousSevenDays = viewsByDay.slice(-14, -7);

  const lastSevenSum = lastSevenDays.reduce((sum, day) => sum + day.views, 0);
  const previousSevenSum = previousSevenDays.reduce((sum, day) => sum + day.views, 0);

  const weeklyTrendValue =
    previousSevenDays.length === 0 || previousSevenSum === 0
      ? null
      : ((lastSevenSum - previousSevenSum) / previousSevenSum) * 100;

  const hasWeeklyTrend =
    typeof weeklyTrendValue === 'number' && Number.isFinite(weeklyTrendValue);
  const weeklyTrend = hasWeeklyTrend
    ? `${weeklyTrendValue >= 0 ? '+' : ''}${weeklyTrendValue.toFixed(1)}%`
    : null;
  const weeklyTrendUp = hasWeeklyTrend && weeklyTrendValue >= 0;

  const sectionEntries = Object.entries(viewsBySection);
  const maxSectionViews =
    sectionEntries.length > 0
      ? Math.max(...sectionEntries.map(([, count]) => count))
      : 0;

  const timeRangeDays = selectedRange === '7d' ? 7 : 30;
  const viewsByDayWindow = viewsByDay.slice(-timeRangeDays);

  const maxDailyViews =
    viewsByDayWindow.length > 0
      ? Math.max(...viewsByDayWindow.map(day => day.views))
      : 0;

  const averageDailyViews =
    viewsByDayWindow.length > 0
      ? Math.round(
          viewsByDayWindow.reduce((sum, day) => sum + day.views, 0) /
            viewsByDayWindow.length
        )
      : 0;

  const hasAnyTrafficData =
    totalViews > 0 ||
    viewsThisMonth > 0 ||
    viewsThisWeek > 0 ||
    viewsToday > 0 ||
    topArticles.some((article) => article.views > 0);

  const formatDayLabel = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });

  const totalSessions = readerDistribution.total;
  const guestPercent =
    totalSessions > 0 ? (readerDistribution.guest / totalSessions) * 100 : 0;
  const registeredPercent = totalSessions > 0 ? 100 - guestPercent : 0;

  const readerSampleInsufficient =
    readerDistribution.sampleSize > 0 &&
    readerDistribution.sampleSize < MIN_CONFIDENT_SESSION_SAMPLE;

  const readingSampleInsufficient =
    readingTime.sampleSize > 0 && readingTime.sampleSize < MIN_READING_SAMPLE;

  const shareSampleInsufficient =
    (shareMetrics.sampleSize > 0 && shareMetrics.sampleSize < MIN_CONFIDENT_SESSION_SAMPLE) ||
    (shareMetrics.totalShares > 0 && shareMetrics.totalShares < MIN_SHARE_EVENTS);

  const completionRateLabel = formatPercentLabel(readingTime.completionRate);
  const averageReadLabel = formatDuration(readingTime.averageSeconds);
  const medianReadLabel = formatDuration(readingTime.medianSeconds);
  const p90ReadLabel = formatDuration(readingTime.p90Seconds);
  const shareRateLabel = formatPercentLabel(shareMetrics.shareRate);

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatsCard
            icon={Eye}
            label="Vistas Totales"
            value={hasAnyTrafficData ? totalViews.toLocaleString() : 'Sin datos'}
            color="#F4A261"
          />
          <StatsCard
            icon={BarChart3}
            label="Vistas del Mes"
            value={hasAnyTrafficData ? viewsThisMonth.toLocaleString() : 'Sin datos'}
            trend={monthlyTrend ?? undefined}
            trendUp={monthlyTrend ? monthlyTrendUp : undefined}
            color="#2A9D8F"
          />
          <StatsCard
            icon={TrendingUp}
            label="Vistas de la Semana"
            value={hasAnyTrafficData ? viewsThisWeek.toLocaleString() : 'Sin datos'}
            trend={weeklyTrend ?? undefined}
            trendUp={weeklyTrend ? weeklyTrendUp : undefined}
            color="#E76F51"
          />
          <StatsCard
            icon={FileText}
            label="Artículos publicados"
            value={totalArticles.toLocaleString()}
            color="#7C348A"
          />
        </div>

        {(!hasAnyTrafficData || viewsAreEstimated) && (
          <div className="mb-8 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5" />
            <span>
              Aún no hay suficientes métricas reales registradas. Publica artículos y activa el seguimiento de vistas para ver datos en este tablero.
            </span>
          </div>
        )}

        {/* Audience & Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Distribución de audiencia</h2>
                <p className="text-xs text-gray-500">
                  Últimos {readerDistribution.windowDays} días · {readerDistribution.sampleSize.toLocaleString()} sesiones analizadas
                </p>
              </div>
            </div>

            {totalSessions > 0 ? (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>Invitados</span>
                      <span>{guestPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${guestPercent}%`, backgroundColor: '#D6BCFA' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {readerDistribution.guest.toLocaleString()} sesiones anónimas
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>Usuarios registrados</span>
                      <span>{registeredPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${registeredPercent}%`, backgroundColor: '#7C3AED' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {readerDistribution.registered.toLocaleString()} sesiones autenticadas
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="rounded-lg border border-dashed border-gray-300 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Sesiones totales</p>
                    <p className="text-lg font-bold text-gray-800">{totalSessions.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Lectores únicos (estimado)</p>
                    <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      {uniqueReadersLabel}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                Aún no hay sesiones registradas para evaluar la distribución de audiencia.
              </div>
            )}

            {readerSampleInsufficient && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertTriangle size={14} className="mt-0.5" />
                <span>
                  Muestra reducida (&lt; {MIN_CONFIDENT_SESSION_SAMPLE} sesiones). Esta distribución es orientativa.
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Timer size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tiempo de lectura</h2>
                <p className="text-xs text-gray-500">
                  {readingTime.sampleSize.toLocaleString()} sesiones con duración registrada · Últimos {readingTime.windowDays} días
                </p>
              </div>
            </div>

            {readingTime.sampleSize > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Promedio</p>
                    <p className="text-xl font-semibold text-gray-800">{averageReadLabel}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Mediana</p>
                    <p className="text-xl font-semibold text-gray-800">{medianReadLabel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Percentil 90</p>
                    <p className="text-xl font-semibold text-gray-800">{p90ReadLabel}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Sesiones completas</p>
                    <p className="text-xl font-semibold text-gray-800">{completionRateLabel}</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Ratio de sesiones con progreso ≥ 80% o 4 minutos de lectura
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                Todavía no hay sesiones con duración registrada. Integra los eventos de lectura para obtener esta métrica.
              </div>
            )}

            {readingSampleInsufficient && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertTriangle size={14} className="mt-0.5" />
                <span>
                  Menos de {MIN_READING_SAMPLE} sesiones con duración. Los valores de tiempo se consideran estimados.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Share metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Share2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Shares y viralidad</h2>
                <p className="text-xs text-gray-500">
                  {shareMetrics.totalShares.toLocaleString()} eventos de compartir · {shareMetrics.sampleSize.toLocaleString()} sesiones evaluadas · Últimos {shareMetrics.windowDays} días
                </p>
              </div>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Share rate: {shareRateLabel}
            </div>
          </div>

          {shareMetrics.totalShares > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Shares totales</p>
                <p className="text-2xl font-semibold text-gray-800">{shareMetrics.totalShares.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Equivale a {shareMetrics.shareRate !== null ? (shareMetrics.shareRate / 100).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0%'} de las sesiones.
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Canales principales</p>
                <div className="space-y-3">
                  {shareMetrics.channels.length > 0 ? (
                    shareMetrics.channels.map((channel) => {
                      const ratio = shareMetrics.totalShares > 0
                        ? (channel.count / shareMetrics.totalShares) * 100
                        : 0;
                      return (
                        <div key={channel.channel} className="rounded-lg border border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-gray-800">{channel.channel}</div>
                            <div className="text-sm text-gray-500">
                              {channel.count.toLocaleString()} shares · {ratio.toFixed(1)}%
                            </div>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${ratio}%`, backgroundColor: 'var(--color-brand-primary)' }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                      Todavía no hay desglose por canal. Registra el canal en cada share para visualizarlo aquí.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
              No se detectaron shares en el período analizado. Activa los botones de compartir para comenzar a medir esta métrica.
            </div>
          )}

          {shareSampleInsufficient && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5" />
              <span>
                Muestra limitada de sesiones o shares (&lt; {MIN_SHARE_EVENTS} eventos). Considera estos valores como estimados.
              </span>
            </div>
          )}
        </div>

        {/* Views by Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="mb-6 text-lg font-semibold">
            Vistas por sección
          </h2>

          {sectionEntries.length > 0 ? (
            <div className="space-y-4">
              {sectionEntries
                .sort(([, a], [, b]) => b - a)
                .map(([section, views], index) => {
                  const percentage = maxSectionViews > 0 ? (views / maxSectionViews) * 100 : 0;

                  return (
                    <motion.div
                      key={section}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="capitalize text-sm font-semibold text-gray-700">
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
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
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
              Sin datos de vistas por sección todavía. Empieza a registrar vistas para ver la distribución.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Vistas diarias
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setSelectedRange('7d')}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  selectedRange === '7d'
                    ? 'bg-[var(--color-brand-primary)] text-white border-transparent'
                    : 'border-gray-300 text-gray-600 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]'
                }`}
              >
                7 días
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('30d')}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  selectedRange === '30d'
                    ? 'bg-[var(--color-brand-primary)] text-white border-transparent'
                    : 'border-gray-300 text-gray-600 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]'
                }`}
              >
                30 días
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Promedio diario (rango seleccionado): {averageDailyViews.toLocaleString()}
          </p>

          {viewsByDayWindow.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-end gap-3 overflow-x-auto pb-2">
                {viewsByDayWindow.map(day => {
                  const height = maxDailyViews > 0 ? (day.views / maxDailyViews) * 120 : 0;
                  const barHeight = Math.max(height, 8);

                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2 text-xs text-gray-500">
                      <div
                        className="w-8 rounded-t-md"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: 'var(--color-brand-primary)',
                          opacity: day.views === 0 ? 0.35 : 1
                        }}
                      />
                      <span className="font-semibold text-gray-700">{day.views}</span>
                      <span>{formatDayLabel(day.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
              Todavía no hay historial de vistas suficiente para mostrar la tendencia diaria.
            </div>
          )}
        </div>

        {/* Top Articles */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Artículos más vistos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Artículo</th>
                  <th className="px-6 py-4 text-right">Vistas</th>
                </tr>
              </thead>
              <tbody>
                {topArticles.length > 0 ? (
                  topArticles.map((article, index) => {
                    const viewsLabel =
                      typeof article.views === 'number' && Number.isFinite(article.views)
                        ? article.views.toLocaleString()
                        : '0';
                    return (
                      <motion.tr
                        key={article.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
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
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 mb-0.5 text-sm font-semibold text-gray-800">
                              {article.title}
                            </h3>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-800">
                            <Eye size={16} className="text-gray-400" />
                            {viewsLabel}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-center text-sm text-gray-500">
                      Aún no se registran vistas en artículos. Las primeras notas leídas aparecerán aquí.
                    </td>
                  </tr>
                )}
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
              {Number.isFinite(averageViewsPerArticle)
                ? averageViewsPerArticle.toLocaleString()
                : '0'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
            <Timer size={32} className="mb-3 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Tiempo de lectura medio</p>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {averageReadLabel}
            </p>
            <p className="text-xs opacity-80 mt-1">
              Mediana: {medianReadLabel} · P90: {p90ReadLabel}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white">
            <Share2 size={32} className="mb-3 opacity-80" />
            <p className="text-sm opacity-90 mb-1">Share rate (últimos {shareMetrics.windowDays} días)</p>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>
              {shareRateLabel}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {shareMetrics.totalShares.toLocaleString()} shares · {shareMetrics.sampleSize.toLocaleString()} sesiones
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
