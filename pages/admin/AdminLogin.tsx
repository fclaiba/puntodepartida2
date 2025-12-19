import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/panel');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        navigate('/panel');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#f9fafb' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            <span className="text-white" style={{ fontSize: '28px', fontWeight: 800 }}>
              P
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            PDP Admin
          </h1>
          <p className="text-gray-600 mt-2" style={{ fontSize: '14px' }}>
            Ingresá a tu cuenta de administración
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#fee2e2', borderColor: '#dc2626' }}
            >
              <p className="text-sm" style={{ color: '#dc2626' }}>
                {error}
              </p>
            </motion.div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block mb-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all"
              placeholder="tu@email.com"
              required
              disabled={loading}
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 transition-all pr-12"
                placeholder="••••••••"
                required
                disabled={loading}
                style={{ fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--color-brand-primary)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            <LogIn size={20} />
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div
          className="mt-8 p-4 rounded-lg"
          style={{ backgroundColor: '#eff6ff' }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', marginBottom: '8px' }}>
            CREDENCIALES DE PRUEBA:
          </p>
          <div className="space-y-2" style={{ fontSize: '12px', color: '#1e40af' }}>
            <div>
              <strong>Admin:</strong> juan@pdp.com
            </div>
            <div>
              <strong>Editor:</strong> maria@pdp.com
            </div>
            <div>
              <strong>Lector:</strong> ana@pdp.com
            </div>
            <div className="pt-2 border-t border-blue-200">
              <strong>Contraseña:</strong> admin123
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
