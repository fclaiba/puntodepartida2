import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Clear previous timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Reset count after 2 seconds
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    // If 5 clicks, navigate to admin
    if (newCount >= 5) {
      setClickCount(0);
      navigate('/admin/login');
    }
  };

  const sections = [
    {
      title: 'Secciones',
      links: [
        { label: 'Política', href: '/politica' },
        { label: 'Economía', href: '/economia' },
        { label: 'Internacional', href: '/internacional' },
        { label: 'Local', href: '/local' },
        { label: 'Opinión', href: '/opinion' },
        { label: 'EXTRATEGIA', href: '/extrategia' }
      ]
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Sobre nosotros', href: '/sobre-nosotros' },
        { label: 'Contacto', href: '#' },
        { label: 'Publicidad', href: '#' },
        { label: 'Términos y condiciones', href: '#' },
        { label: 'Política de privacidad', href: '#' }
      ]
    },
    {
      title: 'Servicios',
      links: [
        { label: 'Newsletter', href: '#' },
        { label: 'RSS', href: '#' },
        { label: 'Aplicación móvil', href: '#' },
        { label: 'Edición impresa', href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer 
      className="mt-12 md:mt-20 py-8 md:py-12 border-t"
      style={{ 
        backgroundColor: 'var(--color-brand-secondary)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="container mx-auto px-5 md:px-10 lg:px-[60px]">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div 
                onClick={handleLogoClick}
                className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer select-none transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                title="Logo"
              >
                <span className="text-white tracking-tight" style={{ fontSize: '24px', fontWeight: 800 }}>
                  P
                </span>
              </div>
              <div>
                <div 
                  className="text-white tracking-tight leading-none"
                  style={{ fontSize: '28px', fontWeight: 800 }}
                >
                  PDP
                </div>
                <div 
                  className="text-white/70 tracking-wide leading-none mt-1"
                  style={{ fontSize: '10px', letterSpacing: '0.1em' }}
                >
                  DIARIO DIGITAL
                </div>
              </div>
            </div>
            <p 
              className="text-white/70 mb-4 md:mb-6 max-w-sm"
              style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: '1.6' }}
            >
              Tu fuente confiable de información. Noticias verificadas y análisis profundo de los acontecimientos que importan.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-2 md:gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 
                className="text-white mb-4"
                style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-white/60 hover:text-white transition-colors"
                        style={{ fontSize: '13px' }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-white/60 hover:text-white transition-colors"
                        style={{ fontSize: '13px' }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div 
          className="py-6 md:py-8 mb-6 md:mb-8 rounded-lg md:rounded-xl"
          style={{ 
            backgroundColor: 'rgba(124, 52, 138, 0.2)',
            border: '1px solid rgba(124, 52, 138, 0.3)'
          }}
        >
          <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
            <h3 
              className="text-white mb-2"
              style={{ fontSize: 'clamp(18px, 3vw, 20px)', fontWeight: 700 }}
            >
              Suscribite a nuestro newsletter
            </h3>
            <p 
              className="text-white/70 mb-4 md:mb-6"
              style={{ fontSize: 'clamp(13px, 2vw, 14px)' }}
            >
              Recibí las noticias más importantes del día en tu correo
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-white/40 transition-colors"
                style={{ fontSize: '14px' }}
              />
              <button
                className="px-6 py-3 rounded-lg transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--color-brand-primary)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Suscribirme
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <p 
            className="text-white/60 text-center md:text-left"
            style={{ fontSize: 'clamp(12px, 2vw, 13px)' }}
          >
            © {currentYear} PDP Diario Digital. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <a 
              href="#" 
              className="text-white/60 hover:text-white transition-colors"
              style={{ fontSize: '13px' }}
            >
              Términos de uso
            </a>
            <a 
              href="#" 
              className="text-white/60 hover:text-white transition-colors"
              style={{ fontSize: '13px' }}
            >
              Privacidad
            </a>
            <a 
              href="#" 
              className="text-white/60 hover:text-white transition-colors"
              style={{ fontSize: '13px' }}
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
