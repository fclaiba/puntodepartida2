import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArticleAudioPlayerProps {
    title: string;
    blocks: string; // The JSON string containing the article blocks
}

export const ArticleAudioPlayer: React.FC<ArticleAudioPlayerProps> = ({ title, blocks }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [textToRead, setTextToRead] = useState('');
    const [error, setError] = useState('');
    const [hasSupport, setHasSupport] = useState(true);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // Check for browser support
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            setHasSupport(false);
            return;
        }

        try {
            // Extract text content from blocks
            const parsedBlocks = JSON.parse(blocks);
            const extractedText = parsedBlocks
                .filter((block: any) => block.type === 'text' && block.content.trim() !== '')
                .map((block: any) => block.content)
                .join('. ');

            const cleanText = extractedText.replace(/<[^>]*>?/gm, ''); // Remove basic HTML tags
            setTextToRead(`${title}. ${cleanText}`);
        } catch (e) {
            console.error('Failed to parse blocks for audio', e);
            setTextToRead(title);
        }

        // Cleanup function when component unmounts
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [title, blocks]);

    const initUtterance = () => {
        if (!textToRead) return null;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'es-AR'; // Argentine Spanish
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error', event);
            if (event.error !== 'canceled') {
                setError('Ocurrió un error al reproducir el audio.');
            }
            setIsPlaying(false);
            setIsPaused(false);
        };

        return utterance;
    };

    const handlePlay = () => {
        if (!hasSupport) return;
        setError('');

        // If currently paused, resume
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        // Play from beginning
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = initUtterance();
        if (utterance) {
            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
            setIsPaused(false);
        }
    };

    const handlePause = () => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsPaused(false);
        }
    };

    if (!hasSupport || !textToRead) return null;

    return (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 inline-flex max-w-full overflow-x-auto shadow-sm">
            <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] shrink-0">
                    <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
                </div>

                <div className="flex flex-col flex-grow min-w-[120px]">
                    <span className="text-xs font-semibold text-gray-700">
                        Escuchar este artículo
                    </span>
                    {error ? (
                        <span className="text-[10px] text-red-500">{error}</span>
                    ) : (
                        <span className="text-[10px] text-gray-500">
                            {isPlaying ? 'Reproduciendo...' : isPaused ? 'Pausado' : 'Generado automáticamente'}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-auto border-l pl-3 border-gray-200">
                    {!isPlaying ? (
                        <button
                            onClick={handlePlay}
                            className="p-2 text-gray-600 hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded-full transition-colors flex flex-col items-center group"
                            title="Escuchar"
                            aria-label="Escuchar artículo"
                        >
                            <Play size={18} className="ml-0.5 fill-current" />
                        </button>
                    ) : (
                        <button
                            onClick={handlePause}
                            className="p-2 text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded-full transition-colors"
                            title="Pausar"
                            aria-label="Pausar lectura"
                        >
                            <Pause size={18} className="fill-current" />
                        </button>
                    )}

                    <AnimatePresence>
                        {(isPlaying || isPaused) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleStop}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Detener"
                                aria-label="Detener lectura"
                            >
                                <Square size={16} className="fill-current" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
