import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Plus,
  Search,
  Trash2,
  UserCheck,
  Mail,
  Calendar,
  Clipboard,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Pencil,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAdmin, User } from '../../contexts/AdminContext';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { UserRole, getRoleLabel, getRoleColor } from '../../data/adminData';

const UserManagementContent: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    userCreationStatus,
    userCreationError,
    resetUserCreationStatus,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [createdUserSummary, setCreatedUserSummary] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [userBeingEdited, setUserBeingEdited] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'lector' as UserRole,
    password: ''
  });

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'lector' as UserRole
  });

  const allowedRoles: UserRole[] = ['lector', 'editor', 'admin'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isCreatingUser = userCreationStatus === 'loading';

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    resetUserCreationStatus();
    setFormError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormError(null);
    resetUserCreationStatus();
    setNewUserData({ name: '', email: '', role: 'lector' });
  };

  const createTemporaryPassword = () => {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `changeme${suffix}`;
  };

  const handleAddUser = async () => {
    const trimmedName = newUserData.name.trim();
    const trimmedEmail = newUserData.email.trim().toLowerCase();
    const selectedRole = newUserData.role;

    setFormError(null);

    if (!trimmedName || !trimmedEmail) {
      const message = 'Completa todos los campos obligatorios';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      const message = 'Ingresa un email válido';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!allowedRoles.includes(selectedRole)) {
      const message = 'Selecciona un rol válido';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      const message = 'Ya existe un usuario con este email';
      setFormError(message);
      toast.error(message);
      return;
    }

    const password = createTemporaryPassword();

    try {
      await addUser({
        name: trimmedName,
        email: trimmedEmail,
        role: selectedRole,
        password,
      });

      toast.success(`Usuario ${trimmedName} creado con éxito`);
      setGeneratedPassword(password);
      setCreatedUserSummary({ name: trimmedName, email: trimmedEmail, role: selectedRole });
      setShowAddModal(false);
      setShowPasswordModal(true);
      setNewUserData({ name: '', email: '', role: 'lector' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el usuario';
      setFormError(message);
      toast.error(message);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPassword('');
    setCreatedUserSummary(null);
    resetUserCreationStatus();
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success('Contraseña copiada al portapapeles');
    } catch (error) {
      console.error('Clipboard error', error);
      toast.error('No se pudo copiar la contraseña');
    }
  };

  const openEditModal = (user: User) => {
    setUserBeingEdited(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      password: ''
    });
    setEditPasswordVisible(false);
    setEditError(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setUserBeingEdited(null);
    setEditError(null);
    setEditFormData({
      name: '',
      email: '',
      role: 'lector',
      password: ''
    });
  };

  const handleSaveEditedUser = async () => {
    if (!userBeingEdited) return;

    const trimmedName = editFormData.name.trim();
    const trimmedEmail = editFormData.email.trim().toLowerCase();
    const selectedRole = editFormData.role;
    const newPassword = editFormData.password.trim();

    setEditError(null);

    if (!trimmedName || !trimmedEmail) {
      const message = 'Completa todos los campos obligatorios';
      setEditError(message);
      toast.error(message);
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      const message = 'Ingresa un email válido';
      setEditError(message);
      toast.error(message);
      return;
    }

    if (!allowedRoles.includes(selectedRole)) {
      const message = 'Selecciona un rol válido';
      setEditError(message);
      toast.error(message);
      return;
    }

    const duplicateEmail = users.some(
      (u) => u.email.toLowerCase() === trimmedEmail && u.id !== userBeingEdited.id
    );

    if (duplicateEmail) {
      const message = 'Ya existe un usuario con este email';
      setEditError(message);
      toast.error(message);
      return;
    }

    const updates: Partial<User> & { password?: string } = {};

    if (trimmedName !== userBeingEdited.name) {
      updates.name = trimmedName;
    }

    if (trimmedEmail !== userBeingEdited.email.toLowerCase()) {
      updates.email = trimmedEmail;
    }

    if (selectedRole !== userBeingEdited.role) {
      updates.role = selectedRole;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        const message = 'La nueva contraseña debe tener al menos 8 caracteres';
        setEditError(message);
        toast.error(message);
        return;
      }
      updates.password = newPassword;
    }

    if (Object.keys(updates).length === 0) {
      toast.info('No se detectaron cambios para guardar');
      closeEditModal();
      return;
    }

    try {
      setIsSavingEdit(true);
      await updateUser(userBeingEdited.id, updates);
      toast.success('Usuario actualizado');
      closeEditModal();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el usuario';
      setEditError(message);
      toast.error(message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!allowedRoles.includes(newRole)) {
      toast.error('Rol inválido');
      return;
    }

    try {
      await updateUser(userId, { role: newRole });
      toast.success('Rol actualizado');
      setEditingUser(null);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo actualizar el rol');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar a ${userName}?`)) {
      try {
        await deleteUser(userId);
        toast.success('Usuario eliminado');
      } catch (error) {
        console.error(error);
        toast.error('No se pudo eliminar el usuario');
      }
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
            onClick={openAddModal}
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
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-gray-600 hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded-lg transition-colors"
                    title="Editar usuario"
                  >
                    <Pencil size={18} />
                  </button>
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
              onClick={closeAddModal}
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
                  {(formError || userCreationError) && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{formError || userCreationError}</span>
                    </div>
                  )}

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
                      <strong>Nota:</strong> Generaremos una contraseña temporal segura (formato <code>changemeXXXX</code>) y la verás en la siguiente pantalla.
                      Compártela solo por un canal seguro y pide al usuario cambiarla en su primer inicio de sesión.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddUser}
                    disabled={isCreatingUser}
                    className="flex-1 px-6 py-3 rounded-lg transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: 'var(--color-brand-primary)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 600,
                      opacity: isCreatingUser ? 0.7 : 1
                    }}
                  >
                    {isCreatingUser ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Creando...
                      </span>
                    ) : (
                      'Crear Usuario'
                    )}
                  </button>
                  <button
                    onClick={closeAddModal}
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && userBeingEdited && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-lg w-full"
            >
              <h2 className="mb-6" style={{ fontSize: '24px', fontWeight: 800 }}>
                Editar Usuario
              </h2>

              <div className="space-y-4">
                {editError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                <div>
                  <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                    placeholder="Nombre y apellido"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                    placeholder="correo@pdp.com"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Rol
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="lector">Lector</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Nueva contraseña (opcional)
                  </label>
                  <div className="relative">
                    <input
                      type={editPasswordVisible ? 'text' : 'password'}
                      value={editFormData.password}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20"
                      placeholder="Dejar vacío para no cambiarla"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setEditPasswordVisible((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      {editPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    <KeyRound size={16} className="mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>
                      Usa al menos 8 caracteres. Si completas este campo, la contraseña actual se
                      reemplazará inmediatamente.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEditedUser}
                  disabled={isSavingEdit}
                  className="flex-1 px-6 py-3 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-70"
                  style={{
                    backgroundColor: 'var(--color-brand-primary)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  {isSavingEdit ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Guardando...
                    </span>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
                <button
                  onClick={closeEditModal}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Confirmation Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClosePasswordModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-8"
            >
              <h2 className="mb-2 text-2xl font-extrabold text-gray-900">
                Usuario creado correctamente
              </h2>
              <p className="mb-6 text-sm text-gray-600">
                Comparte la contraseña temporal de forma segura y solicita al usuario que la cambie en cuanto ingrese.
              </p>

              {createdUserSummary && (
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">{createdUserSummary.name}</p>
                  <p>{createdUserSummary.email}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Rol asignado: {getRoleLabel(createdUserSummary.role)}
                  </p>
                </div>
              )}

              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                  Contraseña temporal
                </div>
                <div className="flex items-center justify-between gap-3">
                  <code className="rounded-lg bg-gray-100 px-3 py-2 text-base font-semibold text-gray-900">
                    {generatedPassword}
                  </code>
                  <button
                    onClick={handleCopyPassword}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400"
                  >
                    <Clipboard size={16} />
                    Copiar
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-amber-900">Recomendación de seguridad</p>
                  <p>
                    Mantén al usuario con permisos mínimos hasta confirmar el cambio de contraseña.
                    Cuando avise que la actualizó, puedes escalar su rol en esta misma pantalla.
                  </p>
                  <p>
                    Si necesita asistencia, coordina con el equipo para emitir una nueva contraseña temporal y compartirla nuevamente de forma segura antes de conceder acceso completo.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClosePasswordModal}
                  className="rounded-lg bg-[var(--color-brand-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
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
