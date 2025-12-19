import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, BookOpen, Layers, FileText, ChevronDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { ProtectedRoute } from "../../../components/admin/ProtectedRoute";
import { useAdmin } from "../../../contexts/AdminContext";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import { cn } from "../../../components/ui/utils";

type Volume = {
  _id: Id<"academic_volumes">;
  title: string;
  volumeNumber: number;
  year: number;
  description: string;
  editorial?: string;
  pdfUrl?: string;
  coverImage?: string;
  isPublished: boolean;
};

type AcademicArticle = {
  _id: Id<"academic_articles">;
  title: string;
  author: string;
  abstract: string;
  pdfUrl?: string;
  pageRange?: string;
};

const ITEMS_PER_PAGE = 6;

const VolumeArticles: React.FC<{
  volumeId: Id<"academic_volumes">;
  onCreateArticle: (volumeId: Id<"academic_volumes">) => void;
  onEditArticle: (volumeId: Id<"academic_volumes">, articleId: Id<"academic_articles">) => void;
}> = ({ volumeId, onCreateArticle, onEditArticle }) => {
  const articles = useQuery(api.academic.getArticlesByVolume, { volumeId });
  const deleteArticle = useMutation(api.academic.deleteArticle);

  const handleDeleteArticle = async (article: AcademicArticle) => {
    const confirmed = window.confirm(`¿Eliminar el artículo "${article.title}"?`);
    if (!confirmed) return;

    try {
      await deleteArticle({ id: article._id });
      toast.success("Artículo académico eliminado");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el artículo");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-gray-50 border border-gray-200 rounded-xl mt-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <FileText size={16} />
            Contenido del volumen
          </div>
          <button
            onClick={() => onCreateArticle(volumeId)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            Nuevo artículo
          </button>
        </div>

        <div className="p-5 space-y-4">
          {articles === undefined ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-6">
              Aún no hay artículos registrados para este volumen.
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {article.title}
                    </h4>
                    <div className="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-3">
                      <span className="font-medium text-gray-600">{article.author}</span>
                      {article.pageRange && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                          {article.pageRange}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{article.abstract}</p>
                  </div>
                  <div className="flex items-center gap-2 md:flex-col md:items-end">
                    {article.pdfUrl && (
                      <a
                        href={article.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Ver PDF
                      </a>
                    )}
                    <button
                      onClick={() => onEditArticle(volumeId, article._id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition"
                    >
                      <Edit3 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

const VolumeListContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAdmin();
  const volumes = useQuery(api.academic.getVolumes);
  const deleteVolume = useMutation(api.academic.deleteVolume);

  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const highlightVolumeId =
    (location.state as { highlightVolumeId?: string } | null)?.highlightVolumeId;
  const initialExpandedId = highlightVolumeId
    ? (highlightVolumeId as Id<"academic_volumes">)
    : null;
  const [expandedVolumeId, setExpandedVolumeId] = useState<Id<"academic_volumes"> | null>(
    initialExpandedId
  );

  const isLoading = volumes === undefined;
  const totalItems = volumes?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (highlightVolumeId) {
      navigate("/panel/extrategia", { replace: true });
    }
  }, [highlightVolumeId, navigate]);

  const highlightInfo = useMemo(() => {
    if (!volumes || !highlightVolumeId) {
      return null;
    }
    const matchIndex = volumes.findIndex((volume) => volume._id === highlightVolumeId);
    if (matchIndex === -1) {
      return null;
    }
    return {
      page: Math.floor(matchIndex / ITEMS_PER_PAGE) + 1,
      volumeId: highlightVolumeId as Id<"academic_volumes">,
    };
  }, [volumes, highlightVolumeId]);

  const effectivePage = currentPage ?? highlightInfo?.page ?? 1;
  const boundedPage = Math.min(Math.max(1, effectivePage), totalPages);

  const paginatedVolumes = useMemo(() => {
    if (!volumes) return [];
    const start = (boundedPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return volumes.slice(start, end);
  }, [volumes, boundedPage]);

  const handleDeleteVolume = async (volume: Volume) => {
    const confirmed = window.confirm(`¿Eliminar el volumen "${volume.title}" y todos sus artículos?`);
    if (!confirmed) return;

    try {
      await deleteVolume({ id: volume._id });
      toast.success("Volumen eliminado correctamente");
      if (expandedVolumeId === volume._id) {
        setExpandedVolumeId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el volumen");
    }
  };

  const handleViewArticles = (volumeId: Id<"academic_volumes">) => {
    setExpandedVolumeId((prev) => (prev === volumeId ? null : volumeId));
  };

  const handleCreateVolume = () => {
    navigate("/panel/extrategia/volumen/nuevo");
  };

  const handleEditVolume = (volumeId: Id<"academic_volumes">) => {
    navigate(`/panel/extrategia/volumen/${volumeId}/editar`);
  };

  const handleCreateArticle = (volumeId: Id<"academic_volumes">) => {
    navigate(`/panel/extrategia/volumen/${volumeId}/articulos/nuevo`);
  };

  const handleEditArticle = (volumeId: Id<"academic_volumes">, articleId: Id<"academic_articles">) => {
    navigate(`/panel/extrategia/volumen/${volumeId}/articulos/${articleId}/editar`);
  };

  const canManage = currentUser?.role === "admin" || currentUser?.role === "editor";

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Colección EXTRATEGIA</h1>
            <p className="text-gray-600 text-sm mt-1">
              Gestiona los volúmenes publicados y su contenido editorial.
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleCreateVolume}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              <Plus size={18} />
              Nuevo volumen
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aún no hay volúmenes</h3>
            <p className="text-gray-500 text-sm">
              Crea tu primer volumen para comenzar a construir el archivo académico.
            </p>
            {canManage && (
              <button
                onClick={handleCreateVolume}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02]"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                <Plus size={16} />
                Registrar volumen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedVolumes.map((volume) => {
              const isExpanded = expandedVolumeId === volume._id;
              return (
                <motion.div
                  key={volume._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex gap-5">
                        <div className="hidden md:block w-24 h-32 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                          {volume.coverImage ? (
                            <img
                              src={volume.coverImage}
                              alt={volume.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                              Sin portada
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                              <Layers size={14} />
                              Volumen {volume.volumeNumber}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {volume.year}
                            </span>
                            {volume.isPublished ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                Publicado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                Borrador
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-xl font-bold text-gray-900">{volume.title}</h3>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{volume.description}</p>
                          {volume.pdfUrl && (
                            <a
                              href={volume.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary)] mt-3"
                            >
                              Ver PDF completo
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <button
                          onClick={() => handleViewArticles(volume._id)}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border transition",
                            isExpanded
                              ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] bg-purple-50"
                              : "border-gray-200 text-gray-700 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                          )}
                        >
                          Ver artículos
                          <ChevronDown
                            size={16}
                            className={cn("transition-transform", isExpanded && "rotate-180")}
                          />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleEditVolume(volume._id)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-gray-200 text-gray-700 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition"
                            >
                              <Edit3 size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteVolume(volume)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <VolumeArticles
                          volumeId={volume._id}
                          onCreateArticle={handleCreateArticle}
                          onEditArticle={handleEditArticle}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        if (boundedPage > 1)
                          setCurrentPage((prev) => Math.max(1, prev - 1));
                      }}
                      className={cn(boundedPage === 1 && "pointer-events-none opacity-50")}
                      href="#prev"
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href={`#page-${page}`}
                          isActive={boundedPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        if (boundedPage < totalPages)
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      }}
                      className={cn(
                        boundedPage === totalPages && "pointer-events-none opacity-50",
                      )}
                      href="#next"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export const VolumeList: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="editor">
      <VolumeListContent />
    </ProtectedRoute>
  );
};

