import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CommentForm } from './CommentForm';
import { User, Calendar } from 'lucide-react';

interface CommentSectionProps {
    articleId: Id<"articles">;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
    const comments = useQuery(api.comments.getPublicByArticle, { articleId });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <section className="py-8 md:py-12 border-t border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Comentarios</h2>

                {/* Comments List */}
                <div className="space-y-6 mb-12">
                    {comments === undefined ? (
                        <div className="text-center py-8 text-gray-500">Cargando comentarios...</div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            No hay comentarios aún. ¡Sé el primero en opinar!
                        </div>
                    ) : (
                        comments.map((comment: any) => (
                            <div key={comment._id} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">{comment.author}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar size={12} />
                                                {formatDate(comment.date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Form */}
                <CommentForm articleId={articleId} />
            </div>
        </section>
    );
};
