import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Instagram, Check } from 'lucide-react';
import { NewsArticle, NewsSection } from '../data/newsData';
import { StoryTemplateSelector, StoryTemplate, getTemplateStyles } from './StoryTemplateSelector';
import { toast } from 'sonner';

// Helper function to get section colors
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

interface InstagramStoryGeneratorProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
}

const getConvexSiteUrl = () => {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convexUrl) return null;
  try {
    const parsed = new URL(convexUrl);
    parsed.hostname = parsed.hostname.replace('.convex.cloud', '.convex.site');
    return parsed.origin;
  } catch {
    return null;
  }
};

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
  const [blobImageUrl, setBlobImageUrl] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);

  const articleUrl = `${window.location.origin}/#/noticia/${article.id}`;

  const fetchImageAsBlob = async (url: string): Promise<HTMLImageElement> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image decode failed'));
      };
      img.src = objectUrl;
    });
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Pre-fetch image as blob when modal opens — blob URLs are same-origin so html2canvas can capture them
  useEffect(() => {
    if (!isOpen) {
      if (blobImageUrl) URL.revokeObjectURL(blobImageUrl);
      setBlobImageUrl(null);
      setImageReady(false);
      return;
    }

    if (!article.imageUrl) {
      setImageReady(true);
      return;
    }

    let revoked = false;
    const convexSiteUrl = getConvexSiteUrl();
    const proxiedUrl = convexSiteUrl
      ? `${convexSiteUrl}/image-proxy?url=${encodeURIComponent(article.imageUrl)}`
      : article.imageUrl;
    const url = proxiedUrl;

    // Convert cross-origin image to same-origin blob URL
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        if (revoked) return;
        const blobUrl = URL.createObjectURL(blob);
        setBlobImageUrl(blobUrl);
        // Pre-decode the image so it's ready when html2canvas clones the DOM
        const img = new Image();
        img.onload = () => !revoked && setImageReady(true);
        img.onerror = () => !revoked && setImageReady(true);
        img.src = blobUrl;
      })
      .catch(() => {
        if (revoked) return;
        // If proxy fetch fails, try direct URL
        setBlobImageUrl(article.imageUrl);
        const img = new Image();
        img.onload = () => !revoked && setImageReady(true);
        img.onerror = () => !revoked && setImageReady(true);
        img.src = article.imageUrl;
      });

    return () => {
      revoked = true;
    };
  }, [isOpen, article.imageUrl]);

  const generateStoryImage = async () => {
    setIsGenerating(true);

    try {
      if (!imageReady) {
        await new Promise<void>(resolve => setTimeout(resolve, 500));
      }

      const W = 1080;
      const H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // Background fallback
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);

      // Draw cover image in true "cover" mode (fills all the story area without distortion)
      if (imageSrc) {
        try {
          const img = await fetchImageAsBlob(imageSrc);
          const imgW = img.naturalWidth;
          const imgH = img.naturalHeight;
          const imgRatio = imgW / imgH;
          const canvasRatio = W / H;

          let sx = 0;
          let sy = 0;
          let sw = imgW;
          let sh = imgH;

          if (imgRatio > canvasRatio) {
            // Image is wider than story: crop horizontally
            sw = imgH * canvasRatio;
            sx = (imgW - sw) / 2;
          } else {
            // Image is taller than story: crop vertically
            sh = imgW / canvasRatio;
            sy = (imgH - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        } catch (e) {
          console.warn('Could not draw cover image, using fallback background', e);
        }
      }

      // Overlay gradients by template
      const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.35);
      const bottomGrad = ctx.createLinearGradient(0, H * 0.65, 0, H);
      if (selectedTemplate === 'minimal') {
        topGrad.addColorStop(0, 'rgba(255,255,255,0.70)');
        topGrad.addColorStop(1, 'rgba(255,255,255,0.15)');
        bottomGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
        bottomGrad.addColorStop(1, 'rgba(255,255,255,0.75)');
      } else if (selectedTemplate === 'bold') {
        topGrad.addColorStop(0, 'rgba(220,38,38,0.90)');
        topGrad.addColorStop(1, 'rgba(220,38,38,0.00)');
        bottomGrad.addColorStop(0, 'rgba(124,45,18,0.00)');
        bottomGrad.addColorStop(1, 'rgba(124,45,18,0.90)');
      } else if (selectedTemplate === 'classic') {
        topGrad.addColorStop(0, 'rgba(31,41,55,0.95)');
        topGrad.addColorStop(1, 'rgba(31,41,55,0.00)');
        bottomGrad.addColorStop(0, 'rgba(17,24,39,0.00)');
        bottomGrad.addColorStop(1, 'rgba(17,24,39,0.95)');
      } else {
        topGrad.addColorStop(0, 'rgba(0,0,0,0.70)');
        topGrad.addColorStop(1, 'rgba(0,0,0,0.00)');
        bottomGrad.addColorStop(0, 'rgba(0,0,0,0.00)');
        bottomGrad.addColorStop(1, 'rgba(0,0,0,0.80)');
      }
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, H * 0.35);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, H * 0.65, W, H * 0.35);

      const styles = getTemplateStyles(selectedTemplate);
      const isMinimal = selectedTemplate === 'minimal';
      const padX = 60;

      // Header badge
      ctx.font = '700 32px Montserrat, Poppins, Arial, sans-serif';
      const badgeText = 'PDP DIARIO';
      const badgeW = ctx.measureText(badgeText).width + 64;
      const badgeH = 48;
      const badgeY = 280;
      ctx.fillStyle = styles.badgeBackground;
      roundRect(ctx, padX, badgeY, badgeW, badgeH, 9999);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, padX + 32, badgeY + badgeH / 2);

      // Section badge
      const sectionText = article.section.toUpperCase();
      ctx.font = '600 30px Montserrat, Poppins, Arial, sans-serif';
      const sectionW = ctx.measureText(sectionText).width + 48;
      const sectionH = 42;
      const sectionY = badgeY + badgeH + 40;
      ctx.fillStyle = getSectionColor(article.section);
      roundRect(ctx, padX, sectionY, sectionW, sectionH, 9999);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(sectionText, padX + 24, sectionY + sectionH / 2);

      // Footer CTA
      const bottomSafe = H - 280;
      const ctaText = 'Leé la noticia  →';
      ctx.font = '600 32px Montserrat, Poppins, Arial, sans-serif';
      const ctaW = ctx.measureText(ctaText).width + 80;
      const ctaH = 60;
      const ctaY = bottomSafe - ctaH;
      ctx.fillStyle = isMinimal ? 'rgba(31,41,55,0.10)' : 'rgba(255,255,255,0.20)';
      roundRect(ctx, padX, ctaY, ctaW, ctaH, 9999);
      ctx.fill();
      ctx.fillStyle = isMinimal ? '#1f2937' : '#ffffff';
      ctx.fillText(ctaText, padX + 40, ctaY + ctaH / 2);

      // Meta
      const metaY = ctaY - 50;
      const metaText = `${article.author}  •  ${article.readTime} min`;
      ctx.font = '500 30px Montserrat, Poppins, Arial, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = isMinimal ? 'rgba(31,41,55,0.70)' : 'rgba(255,255,255,0.90)';
      ctx.fillText(metaText, padX, metaY);

      // Title
      const maxTextW = W - padX * 2;
      ctx.font = '800 68px Montserrat, Poppins, Arial, sans-serif';
      ctx.fillStyle = styles.textColor;
      if (!isMinimal) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
      }
      const titleLines = wrapText(ctx, article.title, maxTextW).slice(0, 4);
      const lineHeight = 78;
      const titleBlockH = titleLines.length * lineHeight;
      const titleStartY = metaY - 36 - titleBlockH;
      titleLines.forEach((line, i) => {
        const finalLine = i === 3 && wrapText(ctx, article.title, maxTextW).length > 4
          ? `${line.slice(0, Math.max(0, line.length - 1))}…`
          : line;
        ctx.fillText(finalLine, padX, titleStartY + (i + 1) * lineHeight);
      });
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) throw new Error('toBlob returned null');

      const url = URL.createObjectURL(blob);
      setGeneratedImageUrl(url);
      setImageGenerated(true);

      // Auto-download / share
      try {
        const file = new File([blob], `pdp-story-${article.id}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: article.title,
            text: `Lee esta noticia en PDP: ${article.title}`,
            url: articleUrl,
            files: [file],
          });
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = `pdp-story-${article.id}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch {
        const a = document.createElement('a');
        a.href = url;
        a.download = `pdp-story-${article.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Story generation error:', err);
      toast.error('Error al generar la imagen. Vuelve a intentar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `pdp-story-${article.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        downloadImage();
        toast.success('Descarga completada. Ahora puedes subirla a Instagram Stories y agregar el link manualmente.');
      }
    } catch {
      downloadImage();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    toast.success('¡Link copiado al portapapeles!');
  };

  useEffect(() => {
    if (isOpen && !imageGenerated) {
      setImageGenerated(false);
      setGeneratedImageUrl(null);
    }
  }, [imageGenerated, isOpen]);

  const templateStyles = getTemplateStyles(selectedTemplate);

  // The image src: use blob (same-origin) if available, otherwise raw URL
  const imageSrc = blobImageUrl || article.imageUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Compartir en Instagram</h2>
                  <p className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>Genera una imagen para Stories</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {!imageGenerated ? (
                  <>
                    <StoryTemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} />

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{
                        width: '270px', height: '480px', margin: '0 auto',
                        borderRadius: '16px', overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                      }}>
                        {/* This is the div that html2canvas captures */}
                        <div
                          ref={storyRef}
                          data-story-canvas
                          style={{
                            position: 'relative', width: '1080px', height: '1920px',
                            transform: 'scale(0.25)', transformOrigin: 'top left',
                            fontFamily: 'Montserrat, Poppins, sans-serif',
                            backgroundColor: '#000'
                          }}
                        >
                          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {/* Gradient overlay */}
                            <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
                              background: templateStyles.overlayGradient
                            }} />

                            {/* Background Image — uses blob URL (same-origin) */}
                            <img
                              src={imageSrc}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />

                            {/* Content overlay */}
                            <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20,
                              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              paddingTop: '280px', paddingBottom: '280px', paddingLeft: '60px', paddingRight: '60px'
                            }}>
                              {/* Top: badge + section */}
                              <div>
                                <div style={{
                                  display: 'inline-block', marginBottom: '40px',
                                  paddingLeft: '32px', paddingRight: '32px', paddingTop: '16px', paddingBottom: '16px',
                                  borderRadius: '9999px', backgroundColor: templateStyles.badgeBackground
                                }}>
                                  <span style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '0.05em', color: '#ffffff' }}>
                                    PDP DIARIO
                                  </span>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                  <div style={{
                                    display: 'inline-block', paddingLeft: '24px', paddingRight: '24px',
                                    paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px',
                                    backgroundColor: getSectionColor(article.section),
                                    transform: 'scale(2.5)', transformOrigin: 'left'
                                  }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      {article.section}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom: title + meta + CTA */}
                              <div>
                                <h1 style={{
                                  marginBottom: '36px', fontSize: '68px', fontWeight: 800, lineHeight: '1.15',
                                  textShadow: selectedTemplate === 'minimal' ? 'none' : '0 4px 20px rgba(0,0,0,0.5)',
                                  color: templateStyles.textColor
                                }}>
                                  {article.title}
                                </h1>
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px',
                                  color: selectedTemplate === 'minimal' ? 'rgba(31,41,55,0.7)' : 'rgba(255,255,255,0.9)'
                                }}>
                                  <span style={{ fontSize: '30px', fontWeight: 500 }}>{article.author}</span>
                                  <span style={{ fontSize: '30px' }}>•</span>
                                  <span style={{ fontSize: '30px' }}>{article.readTime} min</span>
                                </div>
                                <div style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '24px',
                                  paddingLeft: '40px', paddingRight: '40px', paddingTop: '20px', paddingBottom: '20px',
                                  borderRadius: '9999px',
                                  backgroundColor: selectedTemplate === 'minimal' ? 'rgba(31,41,55,0.1)' : 'rgba(255,255,255,0.2)',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <span style={{
                                    fontSize: '32px', fontWeight: 600,
                                    color: selectedTemplate === 'minimal' ? '#1f2937' : '#ffffff'
                                  }}>
                                    Leé la noticia
                                  </span>
                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                    stroke={selectedTemplate === 'minimal' ? '#1f2937' : '#ffffff'}
                                    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={generateStoryImage}
                      disabled={isGenerating || !imageReady}
                      className="w-full py-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      style={{ backgroundColor: '#7c348a', color: 'white', fontSize: '16px', fontWeight: 600 }}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Instagram size={20} />
                          Generar imagen para Stories
                        </>
                      )}
                    </button>
                    <p className="text-center text-gray-500 mt-4" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      La imagen respeta las áreas seguras de Instagram
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#22c55e' }}>
                        <Check size={32} className="text-white" />
                      </div>
                      <h3 className="mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>¡Imagen generada con éxito!</h3>
                      <p className="text-gray-600" style={{ fontSize: '14px' }}>Ahora puedes compartirla o descargarla</p>
                    </div>

                    {generatedImageUrl && (
                      <div className="mb-6">
                        <img src={generatedImageUrl} alt="Preview" className="w-full rounded-xl shadow-lg" style={{ maxHeight: '300px', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <button onClick={shareToInstagram}
                        className="w-full py-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                        <Instagram size={20} /> Compartir en Instagram
                      </button>
                      <button onClick={downloadImage}
                        className="w-full py-4 rounded-xl transition-all hover:scale-[1.02] border-2 flex items-center justify-center gap-3"
                        style={{ borderColor: '#7c348a', color: '#7c348a', fontSize: '16px', fontWeight: 600 }}>
                        <Download size={20} /> Descargar imagen
                      </button>
                    </div>

                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#f9f9f9' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#7c348a' }}>ENLACE DE LA NOTICIA</span>
                        <button onClick={copyLink} className="text-xs px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors" style={{ fontSize: '12px', fontWeight: 500 }}>Copiar</button>
                      </div>
                      <p className="text-gray-600 break-all" style={{ fontSize: '12px' }}>{articleUrl}</p>
                    </div>

                    <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#eff6ff' }}>
                      <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#1e40af' }}>
                        <strong>💡 Tip:</strong> Al subir la imagen a Instagram Stories, puedes agregar el enlace usando el sticker de "Link".
                      </p>
                    </div>

                    <button
                      onClick={() => { setImageGenerated(false); setGeneratedImageUrl(null); }}
                      className="w-full mt-4 py-3 rounded-xl transition-colors hover:bg-gray-100"
                      style={{ fontSize: '14px', fontWeight: 500, color: '#7c348a' }}>
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
