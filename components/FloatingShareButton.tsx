import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Instagram, Facebook, Twitter, Link as LinkIcon, X } from 'lucide-react';

interface FloatingShareButtonProps {
  onInstagramClick: () => void;
  articleTitle: string;
  articleUrl: string;
}

export const FloatingShareButton: React.FC<FloatingShareButtonProps> = ({
  onInstagramClick,
  articleTitle,
  articleUrl
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 200px
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
    setIsExpanded(false);
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`, '_blank');
    setIsExpanded(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    alert('¡Link copiado al portapapeles!');
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-40"
        >
          {/* Expanded Menu */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2"
              >
                {/* Instagram */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onInstagramClick();
                    setIsExpanded(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm"
                  style={{ 
                    background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                    color: 'white'
                  }}
                >
                  <Instagram size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Instagram Stories</span>
                </motion.button>

                {/* Facebook */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={shareOnFacebook}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
                  style={{ backgroundColor: '#1877f2', color: 'white' }}
                >
                  <Facebook size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Facebook</span>
                </motion.button>

                {/* Twitter */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={shareOnTwitter}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
                  style={{ backgroundColor: '#1da1f2', color: 'white' }}
                >
                  <Twitter size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Twitter</span>
                </motion.button>

                {/* Copy Link */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyLink}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
                  style={{ backgroundColor: '#6b7280', color: 'white' }}
                >
                  <LinkIcon size={20} />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Copiar link</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: isExpanded ? '#dc2626' : '#7c348a',
              color: 'white'
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? <X size={24} /> : <Share2 size={24} />}
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
