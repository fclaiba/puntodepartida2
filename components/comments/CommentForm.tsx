import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from 'sonner';
import { Send, User, Mail, MessageSquare } from 'lucide-react';
import { useEngagementTracker } from '../../hooks/useEngagementTracker';
import { useAdmin } from '../../contexts/AdminContext';
import { Link } from 'react-router-dom';

interface CommentFormProps {
    articleId: Id<"articles">;
}

export const CommentForm: React.FC<CommentFormProps> = ({ articleId }) => {
    const createComment = useMutation(api.comments.create);
    const { trackEvent } = useEngagementTracker({ articleId });
    const { currentUser } = useAdmin();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        if (!content.trim()) {
            toast.error('Por favor escribe un comentario');
            return;
        }

        setIsSubmitting(true);
        try {
            await createComment({
                articleId,
                author: currentUser.name || 'Usuario',
                email: currentUser.email,
                content: content
            });
            toast.success('Comentario enviado para moderación');
            setContent('');
            void trackEvent({
                eventType: 'comment_submit',
                metadata: {
                    contentLength: content.length,
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar el comentario');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 text-center transition-colors">
                <MessageSquare size={32} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Debes iniciar sesión para comentar</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Únete a la conversación y comparte tu opinión con la comunidad.</p>
                <Link to="/panel/login" className="inline-block px-6 py-2.5 bg-[var(--color-brand-primary)] text-white font-semibold rounded-lg hover:scale-105 active:scale-95 transition-all">
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 transition-colors">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MessageSquare size={20} className="text-[var(--color-brand-primary)]" />
                Deja tu comentario
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={currentUser.name}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 outline-none cursor-not-allowed"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (privado)</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            value={currentUser.email}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 outline-none cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentario</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all resize-none"
                    placeholder="Escribe tu opinión aquí..."
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[var(--color-brand-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
            >
                {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Send size={18} />
                )}
                Enviar Comentario
            </button>
        </form>
    );
};
