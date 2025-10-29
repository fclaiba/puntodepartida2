import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Instagram, Check, Palette, Link } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { NewsArticle, NewsSection } from '../data/newsData';
import { SectionTag } from './SectionTag';
import { StoryTemplateSelector, StoryTemplate, getTemplateStyles } from './StoryTemplateSelector';

// Helper function to get section colors - using direct hex values for html2canvas compatibility
const getSectionColor = (section: NewsSection): string => {
  const colors: Record<NewsSection, string> = {
    'politica': '#D72638',
    'economia': '#F4A261',
    'internacional': '#40E0D0',
    'local': '#2A9D8F',
    'opinion': '#E76F51',
    'extrategia': '#7c348a'
  };
  return colors[section] || '#7c348a';
};

// Inject inline styles to neutralize CSS variables
const injectCanvasStyles = () => {
  const styleId = 'instagram-story-canvas-override';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  // Override all CSS variables that might be inherited with safe values
  style.textContent = `
    [data-story-canvas],
    [data-story-canvas] *,
    [data-story-canvas] *::before,
    [data-story-canvas] *::after {
      --foreground: #000000 !important;
      --background: #ffffff !important;
      --border: #000000 !important;
      --ring: #000000 !important;
      border-color: transparent !important;
      outline-color: transparent !important;
    }
  `;
  document.head.appendChild(style);
};

interface InstagramStoryGeneratorProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
}

export const InstagramStoryGenerator: React.FC<InstagramStoryGeneratorProps> = ({
  article,
  isOpen,
  onClose
}) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate>('gradient');

  const articleUrl = `${window.location.origin}/noticia/${article.id}`;

  useEffect(() => {
    if (isOpen) {
      injectCanvasStyles();
    }
  }, [isOpen]);

  const generateStoryImage = async () => {
    if (!storyRef.current) return;

    setIsGenerating(true);
    
    try {
      // Preload image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = article.imageUrl;
      });

      // Wait a bit more for fonts to load
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(storyRef.current, {
        width: 1080,
        height: 1920,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        foreignObjectRendering: false,
        removeContainer: true,
        onclone: (doc) => {
          // Elimina estilos globales para evitar funciones de color no soportadas
          doc.querySelectorAll('link[rel="stylesheet"], style').forEach((n) => n.remove());

          const root = doc.querySelector('[data-story-canvas]') as HTMLElement | null;
          if (root) {
            // Resetea todo y aplica sólo lo necesario
            (root.style as any).all = 'initial';
            Object.assign(root.style, {
              position: 'relative',
              width: '1080px',
              height: '1920px',
              transform: 'scale(0.25)',
              transformOrigin: 'top left',
              background: '#ffffff',
              color: '#000000',
              fontFamily: 'Montserrat, Poppins, sans-serif',
            } as Partial<CSSStyleDeclaration>);
          }

          const safe = doc.createElement('style');
          safe.textContent = `
            [data-story-canvas],
            [data-story-canvas] *,
            [data-story-canvas] *::before,
            [data-story-canvas] *::after {
              --foreground: #000000 !important;
              --background: #ffffff !important;
              --border: #000000 !important;
              --ring: #000000 !important;
              --popover: #ffffff !important;
              --popover-foreground: #000000 !important;
              --muted: #cccccc !important;
              --muted-foreground: #666666 !important;
              --accent: #e5e7eb !important;
              --accent-foreground: #030213 !important;
              color: #000 !important;
              background-image: none !important;
              outline: 0 !important;
              outline-color: transparent !important;
              border-color: transparent !important;
              box-shadow: none !important;
              filter: none !important;
            }
          `;
          doc.head.appendChild(safe);

          if (root) {
            root.querySelectorAll('svg').forEach((el) => {
              (el as SVGElement).setAttribute('fill', 'none');
              (el as SVGElement).setAttribute('stroke', '#000');
              (el as SVGElement).setAttribute('color', '#000');
            });
          }
        }
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        throw new Error('No se pudo generar la imagen');
      }

      const url = URL.createObjectURL(blob);
      setGeneratedImageUrl(url);
      setImageGenerated(true);

      // Intentar guardar en galería (Web Share API con archivos)
      try {
        const file = new File([blob], `pdp-story-${article.id}.png`, { type: 'image/png' });
        const canNativeShare =
          typeof navigator !== 'undefined' &&
          'share' in navigator &&
          typeof (navigator as any).share === 'function' &&
          'canShare' in navigator &&
          typeof (navigator as any).canShare === 'function' &&
          (navigator as any).canShare({ files: [file] });

        if (canNativeShare) {
          await (navigator as any).share({
            title: article.title,
            text: `Lee esta noticia en PDP: ${article.title}`,
            url: `${window.location.origin}/noticia/${article.id}`,
            files: [file],
          });
        } else {
          // Fallback: descargar automáticamente
          const link = document.createElement('a');
          link.href = url;
          link.download = `pdp-story-${article.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e) {
        // Si el compartir falla, intentar descarga directa
        const link = document.createElement('a');
        link.href = url;
        link.download = `pdp-story-${article.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsGenerating(false);
    } catch (error) {
      console.warn('html2canvas falló, intentando con html-to-image...', error);
      try {
        // Fallback con html-to-image
        const dataUrl = await toPng(storyRef.current!, {
          width: 1080,
          height: 1920,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
          style: { transform: 'none', transformOrigin: 'top left' },
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const url = URL.createObjectURL(blob);
        setGeneratedImageUrl(url);
        setImageGenerated(true);

        try {
          const file = new File([blob], `pdp-story-${article.id}.png`, { type: 'image/png' });
          const canNativeShare =
            typeof navigator !== 'undefined' &&
            'share' in navigator &&
            typeof (navigator as any).share === 'function' &&
            'canShare' in navigator &&
            typeof (navigator as any).canShare === 'function' &&
            (navigator as any).canShare({ files: [file] });

          if (canNativeShare) {
            await (navigator as any).share({
              title: article.title,
              text: `Lee esta noticia en PDP: ${article.title}`,
              url: `${window.location.origin}/noticia/${article.id}`,
              files: [file],
            });
          } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = `pdp-story-${article.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (_) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `pdp-story-${article.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setIsGenerating(false);
      } catch (fallbackError) {
        console.error('Fallback html-to-image también falló:', fallbackError);
        alert('Error al generar la imagen. Vuelve a intentar.');
        setIsGenerating(false);
      }
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `pdp-story-${article.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToInstagram = async () => {
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `pdp-story-${article.id}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: article.title,
          text: `Lee esta noticia en PDP: ${article.title}`,
          url: articleUrl,
          files: [file]
        });
      } else {
        // Fallback: just download the image
        downloadImage();
        alert('Descarga completada. Ahora puedes subirla a Instagram Stories y agregar el link manualmente.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      downloadImage();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    alert('¡Link copiado al portapapeles!');
  };

  React.useEffect(() => {
    if (isOpen && !imageGenerated) {
      // Reset state when opening
      setImageGenerated(false);
      setGeneratedImageUrl(null);
    }
  }, [isOpen]);

  const templateStyles = getTemplateStyles(selectedTemplate);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10"
              >
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
                    Compartir en Instagram
                  </h2>
                  <p className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>
                    Genera una imagen para Stories
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Preview of the story */}
                {!imageGenerated ? (
                  <>
                    {/* Template Selector */}
                    <StoryTemplateSelector
                      selected={selectedTemplate}
                      onSelect={setSelectedTemplate}
                    />

                    <div style={{ marginBottom: '24px' }}>
                      <div 
                        style={{ 
                          width: '270px', 
                          height: '480px',
                          transform: 'scale(1)',
                          margin: '0 auto',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                      >
                        <div 
                          ref={storyRef}
                          data-story-canvas
                          style={{ 
                            position: 'relative',
                            width: '1080px', 
                            height: '1920px',
                            transform: 'scale(0.25)',
                            transformOrigin: 'top left',
                            fontFamily: 'Montserrat, Poppins, sans-serif'
                          }}
                        >
                          {/* Story Background */}
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            position: 'relative' 
                          }}>
                            {/* Top gradient overlay */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 10,
                                background: templateStyles.overlayGradient
                              }}
                            />
                            
                            {/* Background Image */}
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                            />

                            {/* Content Overlay - Respeta áreas seguras de Instagram (250px arriba/abajo) */}
                            <div style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 20,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              paddingTop: '280px',
                              paddingBottom: '280px',
                              paddingLeft: '60px',
                              paddingRight: '60px'
                            }}>
                              {/* Top Section - Zona segura superior */}
                              <div>
                                <div 
                                  style={{ 
                                    display: 'inline-block',
                                    marginBottom: '40px',
                                    paddingLeft: '32px',
                                    paddingRight: '32px',
                                    paddingTop: '16px',
                                    paddingBottom: '16px',
                                    borderRadius: '9999px',
                                    backgroundColor: templateStyles.badgeBackground 
                                  }}
                                >
                                  <span 
                                    style={{ 
                                      fontSize: '32px', 
                                      fontWeight: 700, 
                                      letterSpacing: '0.05em',
                                      color: '#ffffff'
                                    }}
                                  >
                                    PDP DIARIO
                                  </span>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                  <div 
                                    style={{ 
                                      display: 'inline-block',
                                      paddingLeft: '24px',
                                      paddingRight: '24px',
                                      paddingTop: '8px',
                                      paddingBottom: '8px',
                                      borderRadius: '9999px',
                                      backgroundColor: getSectionColor(article.section),
                                      transform: 'scale(2.5)', 
                                      transformOrigin: 'left' 
                                    }}
                                  >
                                    <span 
                                      style={{ 
                                        fontSize: '12px', 
                                        fontWeight: 600,
                                        color: '#ffffff',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                      }}
                                    >
                                      {article.section}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Section - Zona segura inferior */}
                              <div>
                                <h1 
                                  style={{ 
                                    marginBottom: '36px',
                                    fontSize: '68px',
                                    fontWeight: 800,
                                    lineHeight: '1.15',
                                    textShadow: selectedTemplate === 'minimal' ? 'none' : '0 4px 20px rgba(0,0,0,0.5)',
                                    color: templateStyles.textColor
                                  }}
                                >
                                  {article.title}
                                </h1>

                                <div 
                                  style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    marginBottom: '40px',
                                    color: selectedTemplate === 'minimal' ? 'rgba(31,41,55,0.7)' : 'rgba(255,255,255,0.9)'
                                  }}
                                >
                                  <span style={{ fontSize: '30px', fontWeight: 500 }}>
                                    {article.author}
                                  </span>
                                  <span style={{ fontSize: '30px' }}>•</span>
                                  <span style={{ fontSize: '30px' }}>
                                    {article.readTime} min
                                  </span>
                                </div>

                                <div 
                                  style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    paddingLeft: '40px',
                                    paddingRight: '40px',
                                    paddingTop: '20px',
                                    paddingBottom: '20px',
                                    borderRadius: '9999px',
                                    backgroundColor: selectedTemplate === 'minimal' ? 'rgba(31,41,55,0.1)' : 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)'
                                  }}
                                >
                                  <span 
                                    style={{ 
                                      fontSize: '32px', 
                                      fontWeight: 600,
                                      color: selectedTemplate === 'minimal' ? '#1f2937' : '#ffffff'
                                    }}
                                  >
                                    Leé la noticia
                                  </span>
                                  {/* Arrow pointing right */}
                                  <svg 
                                    width="40" 
                                    height="40" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke={selectedTemplate === 'minimal' ? '#1f2937' : '#ffffff'}
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={generateStoryImage}
                      disabled={isGenerating}
                      className="w-full py-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      style={{ 
                        backgroundColor: '#7c348a',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 600
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <div 
                            className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                          />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Instagram size={20} />
                          Generar imagen para Stories
                        </>
                      )}
                    </button>

                    <p 
                      className="text-center text-gray-500 mt-4"
                      style={{ fontSize: '13px', lineHeight: '1.5' }}
                    >
                      La imagen respeta las áreas seguras de Instagram (zona de usuario arriba y zona de respuesta abajo)
                    </p>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <div className="text-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: '#22c55e' }}
                      >
                        <Check size={32} className="text-white" />
                      </div>
                      <h3 
                        className="mb-2"
                        style={{ fontSize: '18px', fontWeight: 600 }}
                      >
                        ¡Imagen generada con éxito!
                      </h3>
                      <p 
                        className="text-gray-600"
                        style={{ fontSize: '14px' }}
                      >
                        Ahora puedes compartirla o descargarla
                      </p>
                    </div>

                    {/* Preview of generated image */}
                    {generatedImageUrl && (
                      <div className="mb-6">
                        <img 
                          src={generatedImageUrl}
                          alt="Preview"
                          className="w-full rounded-xl shadow-lg"
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 mb-6">
                      <button
                        onClick={shareToInstagram}
                        className="w-full py-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                        style={{ 
                          background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <Instagram size={20} />
                        Compartir en Instagram
                      </button>

                      <button
                        onClick={downloadImage}
                        className="w-full py-4 rounded-xl transition-all hover:scale-[1.02] border-2 flex items-center justify-center gap-3"
                        style={{ 
                          borderColor: '#7c348a',
                          color: '#7c348a',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        <Download size={20} />
                        Descargar imagen
                      </button>
                    </div>

                    {/* Link to copy */}
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: '#f9f9f9' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span 
                          style={{ fontSize: '12px', fontWeight: 600, color: '#7c348a' }}
                        >
                          ENLACE DE LA NOTICIA
                        </span>
                        <button
                          onClick={copyLink}
                          className="text-xs px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                          style={{ fontSize: '12px', fontWeight: 500 }}
                        >
                          Copiar
                        </button>
                      </div>
                      <p 
                        className="text-gray-600 break-all"
                        style={{ fontSize: '12px' }}
                      >
                        {articleUrl}
                      </p>
                    </div>

                    <div 
                      className="mt-4 p-4 rounded-xl"
                      style={{ backgroundColor: '#eff6ff' }}
                    >
                      <p 
                        style={{ fontSize: '13px', lineHeight: '1.5', color: '#1e40af' }}
                      >
                        <strong>💡 Tip:</strong> Al subir la imagen a Instagram Stories, puedes agregar el enlace usando el sticker de "Link" para que tus seguidores puedan deslizar y leer la noticia completa.
                      </p>
                    </div>

                    {/* Generate another */}
                    <button
                      onClick={() => {
                        setImageGenerated(false);
                        setGeneratedImageUrl(null);
                      }}
                      className="w-full mt-4 py-3 rounded-xl transition-colors hover:bg-gray-100"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#7c348a' }}
                    >
                      Generar otra imagen
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
