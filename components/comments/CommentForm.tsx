import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from 'sonner';
import { Send, User, Mail, MessageSquare } from 'lucide-react';
import { useEngagementTracker } from '../../hooks/useEngagementTracker';

interface CommentFormProps {
    articleId: Id<"articles">;
}

export const CommentForm: React.FC<CommentFormProps> = ({ articleId }) => {
    const createComment = useMutation(api.comments.create);
    const { trackEvent } = useEngagementTracker({ articleId });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        author: '',
        email: '',
        content: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.author.trim() || !formData.email.trim() || !formData.content.trim()) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        setIsSubmitting(true);
        try {
            await createComment({
                articleId,
                author: formData.author,
                email: formData.email,
                content: formData.content
            });
            toast.success('Comentario enviado para moderación');
            setFormData({ author: '', email: '', content: '' });
            void trackEvent({
                eventType: 'comment_submit',
                metadata: {
                    contentLength: formData.content.length,
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar el comentario');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-[var(--color-brand-primary)]" />
                Deja tu comentario
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all"
                            placeholder="Tu nombre"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (no será publicado)</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all resize-none"
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
