import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { NewsTicker } from './NewsTicker';

const navItems = [
  { label: 'Política', href: '/politica' },
  { label: 'Economía', href: '/economia' },
  { label: 'Internacional', href: '/internacional' },
  { label: 'Local', href: '/local' },
  { label: 'Opinión', href: '/opinion' },
  { label: 'EXTRATEGIA', href: '/extrategia', isSpecial: true },
];

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <NewsTicker />
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px]">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <Link to="/" className="flex items-center gap-2 md:gap-3 touch-manipulation active:scale-98">
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                >
                  <span className="text-white tracking-tight" style={{ fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 800 }}>
                    P
                  </span>
                </div>
                <div>
                  <div
                    className="tracking-tight leading-none"
                    style={{
                      fontSize: 'clamp(20px, 4vw, 24px)',
                      fontWeight: 800,
                      color: 'var(--color-brand-primary)'
                    }}
                  >
                    PDP
                  </div>
                  <div
                    className="tracking-wide leading-none mt-0.5 hidden sm:block"
                    style={{
                      fontSize: '10px',
                      fontWeight: 400,
                      color: 'var(--color-brand-secondary)',
                      letterSpacing: '0.1em'
                    }}
                  >
                    DIARIO DIGITAL
                  </div>
                </div>
              </Link>
            </div>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 pb-4 border-t border-gray-100 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`relative group py-1 transition-colors ${item.isSpecial
                    ? 'text-[var(--color-brand-primary)] font-bold'
                    : 'hover:text-[var(--color-brand-primary)]'
                  }`}
                style={{
                  fontSize: item.isSpecial ? '14px' : '14px',
                  fontWeight: item.isSpecial ? 700 : 500,
                  letterSpacing: item.isSpecial ? '0.05em' : '0.02em'
                }}
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-4 md:py-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-2xl mx-auto">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar noticias..."
                    className="flex-1 bg-transparent outline-none"
                    autoFocus
                    style={{ fontSize: '16px' }}
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-6 py-2 rounded-lg transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'var(--color-brand-primary)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      Buscar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-8">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-brand-primary)' }}
                    >
                      <span className="text-white tracking-tight" style={{ fontSize: '20px', fontWeight: 800 }}>
                        P
                      </span>
                    </div>
                    <div
                      className="tracking-tight"
                      style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        color: 'var(--color-brand-primary)'
                      }}
                    >
                      PDP
                    </div>
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Search in mobile menu */}
                <Link
                  to="/buscar"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 mb-4 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation active:bg-gray-200"
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <Search size={20} />
                  Buscar noticias
                </Link>

                <div
                  className="mb-4 pb-4"
                  style={{ borderBottom: '1px solid #e5e5e5' }}
                >
                  <span
                    className="px-4 text-gray-500"
                    style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}
                  >
                    SECCIONES
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3.5 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation active:bg-gray-200"
                      style={{ fontSize: '16px', fontWeight: 500 }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Newsletter CTA in mobile menu */}
                <div
                  className="mt-8 p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-neutral-500) 100%)'
                  }}
                >
                  <h3
                    className="text-white mb-2"
                    style={{ fontSize: '16px', fontWeight: 700 }}
                  >
                    Newsletter
                  </h3>
                  <p
                    className="text-white/90 mb-4"
                    style={{ fontSize: '13px', lineHeight: '1.5' }}
                  >
                    Recibí las noticias más importantes del día
                  </p>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2 rounded-lg mb-2 outline-none"
                    style={{ fontSize: '14px' }}
                  />
                  <button
                    className="w-full px-4 py-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: 'var(--color-brand-secondary)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    Suscribirme
                  </button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
