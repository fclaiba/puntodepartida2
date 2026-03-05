import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Mail, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../contexts/AdminContext';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from 'sonner';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  const verifyEmailCodeMutation = useMutation(api.users.verifyEmailCode);
  const resendVerificationCodeMutation = useMutation(api.users.resendVerificationCode);

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
    } catch (err: any) {
      if (err.message && err.message.includes('NOT_VERIFIED')) {
        setShowVerificationModal(true);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifying(true);

    try {
      await verifyEmailCodeMutation({ email, code: verificationCode });
      setVerifySuccess(true);
      setTimeout(async () => {
        // Retry login after verification
        const success = await login(email, password);
        if (success) {
          navigate('/panel');
        } else {
          setVerifyError('Error al iniciar sesión tras verificar');
          setVerifySuccess(false);
        }
      }, 1500);
    } catch (err: any) {
      setVerifyError(err.message || 'Error al verificar el código');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCodeMutation({ email });
      setVerifyError('');
      // You could add a toast here like sonner
      toast.success("Código reenviado a tu email.");
    } catch (err: any) {
      setVerifyError(err.message || 'Error al reenviar el código');
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

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <Mail size={32} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Revisa tu Email
                </h2>

                <p className="text-gray-600 mb-6 text-sm">
                  Hemos enviado un código de verificación de 6 dígitos a <br />
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>

                {verifySuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-4 space-y-3"
                  >
                    <CheckCircle className="text-green-500 w-12 h-12" />
                    <p className="text-green-700 font-medium">¡Cuenta verificada!</p>
                    <p className="text-sm text-gray-500">Iniciando sesión...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-4">
                    {verifyError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-left">
                        {verifyError}
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        placeholder="Ingresa el código"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full text-center px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-2xl tracking-widest font-mono transition-all"
                        maxLength={6}
                        required
                        disabled={verifying}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifying || verificationCode.length < 6}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {verifying ? 'Verificando...' : 'Verificar Cuenta'}
                    </button>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        disabled={verifying}
                      >
                        <RefreshCcw size={14} /> Reenviar código
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowVerificationModal(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={verifying}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
