import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Search, Edit, Trash2, UserCheck, Mail, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { UserRole, getRoleLabel, getRoleColor } from '../../data/adminData';

const UserManagementContent: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'lector' as UserRole
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUserData.name.trim() || !newUserData.email.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    if (users.some(u => u.email === newUserData.email)) {
      toast.error('Ya existe un usuario con este email');
      return;
    }

    addUser(newUserData);
    toast.success(`Usuario ${newUserData.name} creado con éxito. Contraseña: changeme123`);
    setShowAddModal(false);
    setNewUserData({ name: '', email: '', role: 'lector' });
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    updateUser(userId, { role: newRole });
    toast.success('Rol actualizado');
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar a ${userName}?`)) {
      deleteUser(userId);
      toast.success('Usuario eliminado');
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '4px' }}>
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} en el sistema
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            style={{ 
              backgroundColor: 'var(--color-brand-primary)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios por nombre o email..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* User Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getRoleColor(user.role) }}
                >
                  <span style={{ fontSize: '24px', fontWeight: 700 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {currentUser?.id !== user.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* User Info */}
              <h3 className="mb-1" style={{ fontSize: '18px', fontWeight: 700 }}>
                {user.name}
                {currentUser?.id === user.id && (
                  <span className="ml-2 text-xs text-gray-500">(Tú)</span>
                )}
              </h3>
              
              <div className="flex items-center gap-2 mb-3 text-gray-600">
                <Mail size={14} />
                <p className="text-sm truncate">{user.email}</p>
              </div>

              {/* Role Badge */}
              <div className="mb-4">
                {editingUser === user.id ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                    onBlur={() => setEditingUser(null)}
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg border-2 border-[var(--color-brand-primary)] outline-none"
                    style={{ fontSize: '14px' }}
                  >
                    <option value="lector">Lector</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                ) : (
                  <button
                    onClick={() => setEditingUser(user.id)}
                    className="w-full px-3 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: getRoleColor(user.role),
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {getRoleLabel(user.role)}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Artículos</p>
                  <p style={{ fontSize: '18px', fontWeight: 700 }}>
                    {user.articlesPublished || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Último acceso</p>
                  <p className="text-xs">
                    {new Date(user.lastLogin).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-gray-500">
                <Calendar size={14} />
                <p className="text-xs">
                  Creado: {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
              >
                <h2 className="mb-6" style={{ fontSize: '24px', fontWeight: 800 }}>
                  Crear Nuevo Usuario
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                      placeholder="Juan Pérez"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                      placeholder="juan@pdp.com"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      Rol
                    </label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                      style={{ fontSize: '16px' }}
                    >
                      <option value="lector">Lector</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Nota:</strong> La contraseña por defecto será "changeme123". El usuario deberá cambiarla en su primer acceso.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 px-6 py-3 rounded-lg transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: 'var(--color-brand-primary)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    Crear Usuario
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewUserData({ name: '', email: '', role: 'lector' });
                    }}
                    className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ fontSize: '16px', fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export const UserManagement: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <UserManagementContent />
    </ProtectedRoute>
  );
};
