import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload, FileText, Loader2, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { ProtectedRoute } from "../../../components/admin/ProtectedRoute";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { useConvexUpload } from "../../../hooks/useConvexUpload";

const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB

type ArticleFormState = {
  title: string;
  author: string;
  abstract: string;
  pageRange: string;
  pdfUrl: string;
};

const defaultFormState: ArticleFormState = {
  title: "",
  author: "",
  abstract: "",
  pageRange: "",
  pdfUrl: "",
};

const AcademicArticleEditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { volumeId, articleId } = useParams<{
    volumeId: string;
    articleId?: string;
  }>();
  const isEditing = Boolean(articleId);

  const uploadFile = useConvexUpload();
  const createArticle = useMutation(api.academic.createArticle);
  const updateArticle = useMutation(api.academic.updateArticle);

  const volume = useQuery(
    api.academic.getVolumeById,
    volumeId ? { id: volumeId as Id<"academic_volumes"> } : "skip"
  );

  const existingArticle = useQuery(
    api.academic.getArticleById,
    isEditing && articleId ? { id: articleId as Id<"academic_articles"> } : "skip"
  );

  const [formState, setFormState] = useState<ArticleFormState>(defaultFormState);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existingArticle) return;
    setFormState({
      title: existingArticle.title,
      author: existingArticle.author,
      abstract: existingArticle.abstract,
      pageRange: existingArticle.pageRange || "",
      pdfUrl: existingArticle.pdfUrl || "",
    });
    setSelectedPdfFile(null);
  }, [existingArticle]);

  useEffect(() => {
    if (volume === null) {
      toast.error("Volumen no encontrado");
      navigate("/panel/extrategia");
    }
  }, [volume, navigate]);

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("El archivo debe ser un PDF");
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      toast.error("El PDF no debe superar los 25MB");
      return;
    }

    setSelectedPdfFile(file);
  };

  const clearPdfSelection = () => {
    setSelectedPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!formState.title.trim()) {
      toast.error("El título es obligatorio");
      return false;
    }
    if (!formState.author.trim()) {
      toast.error("El autor es obligatorio");
      return false;
    }
    if (!formState.abstract.trim()) {
      toast.error("El resumen es obligatorio");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !volumeId) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let pdfStorageId: Id<"_storage"> | undefined;
      let pdfUrl = formState.pdfUrl.trim() || undefined;

      if (selectedPdfFile) {
        pdfStorageId = await uploadFile(selectedPdfFile);
        pdfUrl = undefined;
      }

      const payload = {
        title: formState.title.trim(),
        author: formState.author.trim(),
        abstract: formState.abstract.trim(),
        pageRange: formState.pageRange.trim() || undefined,
        pdfUrl,
        storageId: pdfStorageId,
      };

      if (isEditing && articleId) {
        await updateArticle({
          id: articleId as Id<"academic_articles">,
          ...payload,
        });
        toast.success("Artículo actualizado con éxito");
      } else {
        await createArticle({
          volumeId: volumeId as Id<"academic_volumes">,
          ...payload,
        });
        toast.success("Artículo creado con éxito");
      }

      navigate("/panel/extrategia", { state: { highlightVolumeId: volumeId } });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar el artículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = volume === undefined || (isEditing && existingArticle === undefined);

  if (!volumeId) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Falta el identificador del volumen.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="min-h-[320px] flex items-center justify-center bg-white rounded-2xl shadow-sm">
          <LoadingSpinner />
        </div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/panel/extrategia", { state: { highlightVolumeId: volumeId } })}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--color-brand-primary)] tracking-wide">
                  Volumen {volume?.volumeNumber ?? ""} • {volume?.title ?? ""}
                </p>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Editar artículo académico" : "Nuevo artículo académico"}
                </h1>
                <p className="text-gray-500 text-sm">
                  Completa la metadata y el archivo del artículo para la revista.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Guardando..." : "Guardar artículo"}
            </button>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                  placeholder="Ej. La estrategia republicana y su vigencia"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  value={formState.author}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, author: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                  placeholder="Nombre completo del autor"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resumen
                </label>
                <textarea
                  value={formState.abstract}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, abstract: event.target.value }))
                  }
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                  placeholder="Resume los puntos clave del artículo..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rango de páginas (opcional)
                </label>
                <input
                  type="text"
                  value={formState.pageRange}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, pageRange: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                  placeholder="pp. 12-34"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-brand-primary)]" />
              Documento PDF
            </h3>
            <p className="text-sm text-gray-500">
              Proporciona el enlace del PDF o súbelo para almacenarlo en Convex.
            </p>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <input
                type="text"
                value={formState.pdfUrl}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, pdfUrl: event.target.value }))
                }
                placeholder="https://..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
              />
              <span className="text-xs uppercase text-gray-400 font-semibold text-center">
                o
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition"
                >
                  <Upload size={16} />
                  Subir PDF
                </button>
                {selectedPdfFile && (
                  <div className="inline-flex items-center gap-2 text-xs text-gray-600 border border-gray-200 rounded-full px-3 py-1">
                    {selectedPdfFile.name}
                    <button
                      type="button"
                      onClick={clearPdfSelection}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {formState.pdfUrl && (
              <a
                href={formState.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary)]"
              >
                Ver PDF actual
              </a>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfChange}
            />
          </section>
        </motion.form>
      )}
    </AdminLayout>
  );
};

export const AcademicArticleEditor: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="editor">
      <AcademicArticleEditorContent />
    </ProtectedRoute>
  );
};



