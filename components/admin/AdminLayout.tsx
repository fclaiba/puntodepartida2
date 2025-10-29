import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { getRoleLabel } from '../../data/adminData';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, comments } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const pendingComments = comments.filter(c => c.status === 'pending').length;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Artículos', path: '/admin/articles' },
    { 
      icon: MessageCircle, 
      label: 'Comentarios', 
      path: '/admin/comments',
      badge: pendingComments > 0 ? pendingComments : undefined
    },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Activity, label: 'Actividad', path: '/admin/activity' },
    { icon: Users, label: 'Usuarios', path: '/admin/users', adminOnly: true },
    { icon: Settings, label: 'Configuración', path: '/admin/settings', adminOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || currentUser?.role === 'admin'
  );

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4 md:px-6"
      >
        <div className="flex items-center justify-between w-full">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <Link to="/admin" className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
              >
                <span className="text-white" style={{ fontSize: '16px', fontWeight: 800 }}>
                  P
                </span>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                  PDP Admin
                </div>
              </div>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div style={{ fontSize: '14px', fontWeight: 600 }}>
                {currentUser.name}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {getRoleLabel(currentUser.role)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-4">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all relative ${
                  isActive 
                    ? 'bg-[var(--color-brand-primary)] text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span 
                    className="ml-auto px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#ef4444',
                      color: isActive ? 'white' : 'white',
                      fontWeight: 600
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Back to Site */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[var(--color-brand-primary)] transition-colors"
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              Ver sitio público
            </span>
          </Link>
        </div>
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-16 bottom-0 w-64 bg-white z-40 overflow-y-auto lg:hidden shadow-xl"
            >
              <nav className="p-4">
                {filteredMenuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all relative ${
                        isActive 
                          ? 'bg-[var(--color-brand-primary)] text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span 
                          className="ml-auto px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#ef4444',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[var(--color-brand-primary)] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Ver sitio público
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
