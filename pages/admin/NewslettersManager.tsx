import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Users, Download, Mail, Star, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const NewslettersManagerContent: React.FC = () => {
    const subscribers = useQuery(api.newsletters.getAll);
    const topArticles = useQuery(api.newsletters.getTopWeeklyArticles);
    const [isExporting, setIsExporting] = useState(false);

    const activeSubscribers = subscribers?.filter(s => s.status === 'active') || [];
    const unsubscribed = subscribers?.filter(s => s.status === 'unsubscribed') || [];

    const handleExportCSV = () => {
        if (!subscribers || subscribers.length === 0) {
            toast.error("No hay suscriptores para exportar");
            return;
        }

        setIsExporting(true);
        try {
            // Create CSV header
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Email,Status,Date Subscribed\n";

            // Add rows
            subscribers.forEach(sub => {
                const date = new Date(sub.subscribedAt).toLocaleDateString('es-AR');
                csvContent += `${sub.email},${sub.status},${date}\n`;
            });

            // Trigger download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `suscriptores-pdp-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Archivo descargado exitosamente");
        } catch (error) {
            toast.error("Error exportando CSV");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    if (subscribers === undefined || topArticles === undefined) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-20"><LoadingSpinner /></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Newsletters</h1>
                    <p className="text-sm text-gray-500">Administra tus suscriptores y observa el contenido de la semana</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={isExporting || subscribers.length === 0}
                    className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <Download size={18} /> {isExporting ? 'Exportando...' : 'Exportar CSV'}
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-[var(--color-brand-primary)]">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Suscriptores Activos</p>
                            <h3 className="text-2xl font-bold text-gray-900">{activeSubscribers.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Registros (Histórico)</p>
                            <h3 className="text-2xl font-bold text-gray-900">{subscribers.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Desuscritos (Bajas)</p>
                            <h3 className="text-2xl font-bold text-gray-900">{unsubscribed.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subscribers List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold">Últimos Suscriptores</h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                            Aun no hay suscriptores.
                                        </td>
                                    </tr>
                                ) : subscribers.slice(0, 50).map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium">{sub.email}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase
                                        ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {sub.status === 'active' ? 'Activo' : 'Baja'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500">
                                            {new Date(sub.subscribedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Automation Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Star size={18} className="text-amber-500" /> Top 5 de la semana
                        </h2>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 border rounded-md">Generación Automática</span>
                    </div>
                    <div className="p-6 bg-gray-50 flex-1">
                        <div className="bg-white border rounded-lg p-6 shadow-sm max-w-md mx-auto">
                            <div className="text-center mb-6">
                                <div className="text-[var(--color-brand-primary)] font-bold text-xl mb-1">
                                    Punto de Partida
                                </div>
                                <div className="text-sm text-gray-500">El resumen semanal indispensable</div>
                            </div>
                            <hr className="border-gray-200 mb-6" />
                            <div className="space-y-5">
                                {topArticles.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-8">
                                        No hay suficientes datos de vistas esta semana para generar el resumen.
                                    </div>
                                ) : topArticles.map((article: any, i) => (
                                    <div key={article._id} className="flex gap-4 items-start">
                                        <div className="text-2xl font-bold text-gray-300 font-serif leading-none mt-1">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight mb-1">
                                                {article.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                                {article.description}
                                            </p>
                                            <a href={`/noticia/${article._id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium inline-flex items-center gap-1 hover:underline">
                                                Leer más <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <hr className="border-gray-200 mt-6 mb-4" />
                            <div className="text-center text-xs text-gray-400">
                                Has recibido este correo porque te suscribiste a nuestro boletín.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export const NewslettersManager: React.FC = () => {
    return (
        <ProtectedRoute requiredRole="admin">
            <NewslettersManagerContent />
        </ProtectedRoute>
    );
};
