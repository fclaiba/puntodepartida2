import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';

const CommentModerationContent: React.FC = () => {
  const { comments, approveComment, rejectComment, deleteComment } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.articleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || comment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = comments.filter(c => c.status === 'pending').length;
  const approvedCount = comments.filter(c => c.status === 'approved').length;
  const rejectedCount = comments.filter(c => c.status === 'rejected').length;

  const handleApprove = (id: string) => {
    approveComment(id);
    toast.success('Comentario aprobado');
  };

  const handleReject = (id: string) => {
    rejectComment(id);
    toast.success('Comentario rechazado');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este comentario?')) {
      deleteComment(id);
      toast.success('Comentario eliminado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: '#dcfce7', text: '#16a34a' };
      case 'rejected': return { bg: '#fee2e2', text: '#dc2626' };
      default: return { bg: '#fef3c7', text: '#d97706' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
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
            Moderación de Comentarios
          </h1>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Gestiona y modera los comentarios de los artículos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 text-sm mb-1">Pendientes</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#d97706' }}>
              {pendingCount}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 text-sm mb-1">Aprobados</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>
              {approvedCount}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm mb-1">Rechazados</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>
              {rejectedCount}
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
                placeholder="Buscar comentarios..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all appearance-none"
                style={{ fontSize: '16px' }}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No se encontraron comentarios
            </h3>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              {searchQuery || filterStatus !== 'all' 
                ? 'Intenta con otros filtros' 
                : 'No hay comentarios para moderar'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment, index) => {
              const statusStyle = getStatusColor(comment.status);
              
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                          {comment.author}
                        </h3>
                        <span 
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            fontWeight: 600
                          }}
                        >
                          {getStatusLabel(comment.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{comment.email}</p>
                      <p className="text-gray-500 text-xs">
                        En: <strong>{comment.articleTitle}</strong>
                      </p>
                    </div>
                    <p className="text-gray-500 text-xs">
                      {new Date(comment.date).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        style={{ 
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        <CheckCircle size={16} />
                        Aprobar
                      </button>
                    )}
                    
                    {comment.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(comment.id)}
                        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        style={{ 
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        <XCircle size={16} />
                        Rechazar
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="ml-auto p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export const CommentModeration: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="editor">
      <CommentModerationContent />
    </ProtectedRoute>
  );
};
