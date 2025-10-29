import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Activity, FileText, Users, MessageCircle, Settings, Search, Filter, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';

const ActivityLogContent: React.FC = () => {
  const { activityLog } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'user' | 'comment' | 'settings'>('all');

  const filteredLog = activityLog.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || entry.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'user': return Users;
      case 'comment': return MessageCircle;
      case 'settings': return Settings;
      default: return Activity;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'var(--color-brand-primary)';
      case 'user': return 'var(--color-brand-secondary)';
      case 'comment': return '#F4A261';
      case 'settings': return '#6B7280';
      default: return '#000';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Artículo';
      case 'user': return 'Usuario';
      case 'comment': return 'Comentario';
      case 'settings': return 'Configuración';
      default: return 'Otro';
    }
  };

  // Group by date
  const groupedLog = filteredLog.reduce((groups, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof filteredLog>);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '4px' }}>
            Registro de Actividad
          </h1>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Historial completo de acciones en el sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} style={{ color: 'var(--color-brand-primary)' }} />
              <p className="text-sm text-gray-600">Artículos</p>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {activityLog.filter(e => e.type === 'article').length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} style={{ color: 'var(--color-brand-secondary)' }} />
              <p className="text-sm text-gray-600">Usuarios</p>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {activityLog.filter(e => e.type === 'user').length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={18} style={{ color: '#F4A261' }} />
              <p className="text-sm text-gray-600">Comentarios</p>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {activityLog.filter(e => e.type === 'comment').length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings size={18} style={{ color: '#6B7280' }} />
              <p className="text-sm text-gray-600">Config</p>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700 }}>
              {activityLog.filter(e => e.type === 'settings').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en el registro..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div className="relative">
              <Filter 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all appearance-none"
                style={{ fontSize: '16px' }}
              >
                <option value="all">Todos los tipos</option>
                <option value="article">Artículos</option>
                <option value="user">Usuarios</option>
                <option value="comment">Comentarios</option>
                <option value="settings">Configuración</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        {Object.keys(groupedLog).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No se encontró actividad
            </h3>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              Intenta con otros filtros
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLog).map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={18} className="text-gray-400" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#6b7280' }}>
                    {date}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="space-y-3">
                  {entries.map((entry, index) => {
                    const Icon = getTypeIcon(entry.type);
                    const color = getTypeColor(entry.type);

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon size={20} style={{ color }} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>
                                {entry.action}
                              </h4>
                              <span 
                                className="px-2 py-0.5 rounded text-xs"
                                style={{ 
                                  backgroundColor: `${color}15`,
                                  color: color,
                                  fontWeight: 600
                                }}
                              >
                                {getTypeLabel(entry.type)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {entry.details}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{entry.userName}</span>
                              <span>•</span>
                              <span>
                                {new Date(entry.timestamp).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export const ActivityLog: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="editor">
      <ActivityLogContent />
    </ProtectedRoute>
  );
};
