import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { History, User, FileText, Settings, MessageSquare, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { useAdmin } from '../../contexts/AdminContext';

interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  type?: string;
}

const ActivityLogContent: React.FC = () => {
  const { activityLog, isActivityLogLoading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'user' | 'comment' | 'settings'>('all');

  const getIcon = (action: string) => {
    if (action.includes('article')) return FileText;
    if (action.includes('settings')) return Settings;
    if (action.includes('comment')) return MessageSquare;
    if (action.includes('login')) return User;
    return History;
  };

  const getColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 bg-green-50';
    if (action.includes('update')) return 'text-blue-600 bg-blue-50';
    if (action.includes('delete')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (isActivityLogLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }

  const filteredLog = activityLog.filter((entry: LogEntry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.userId && entry.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.userName && entry.userName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || entry.action.includes(filterType);

    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Registro de Actividad</h1>
          <p className="text-gray-600">Historial de acciones realizadas en el sistema</p>
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredLog.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay actividad registrada que coincida con los filtros.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLog.map((log, index) => {
                const Icon = getIcon(log.action);
                const colorClass = getColor(log.action);

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4"
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {log.action}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {log.details}
                      </p>
                      {(log.userId || log.userName) && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <User size={12} />
                          <span>
                            Usuario: {log.userName ?? log.userId}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
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
