import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload, Image as ImageIcon, FileText, X, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { ProtectedRoute } from "../../../components/admin/ProtectedRoute";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { useConvexUpload } from "../../../hooks/useConvexUpload";

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB

type VolumeFormState = {
  title: string;
  volumeNumber: number;
  year: number;
  description: string;
  editorial: string;
  pdfUrl: string;
  coverImage: string;
  isPublished: boolean;
};

const defaultState = (): VolumeFormState => ({
  title: "",
  volumeNumber: 1,
  year: new Date().getFullYear(),
  description: "",
  editorial: "",
  pdfUrl: "",
  coverImage: "",
  isPublished: false,
});

const VolumeEditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { volumeId } = useParams<{ volumeId: string }>();
  const isEditing = Boolean(volumeId);

  const uploadFile = useConvexUpload();
  const createVolume = useMutation(api.academic.createVolume);
  const updateVolume = useMutation(api.academic.updateVolume);
  const existingVolume = useQuery(
    api.academic.getVolumeById,
    isEditing ? { id: volumeId as Id<"academic_volumes"> } : "skip"
  );

  const [formState, setFormState] = useState<VolumeFormState>(defaultState);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existingVolume) return;

    setFormState({
      title: existingVolume.title,
      volumeNumber: existingVolume.volumeNumber,
      year: existingVolume.year,
      description: existingVolume.description,
      editorial: existingVolume.editorial || "",
      pdfUrl: existingVolume.pdfUrl || "",
      coverImage: existingVolume.coverImage || "",
      isPublished: existingVolume.isPublished,
    });

    setCoverPreview(existingVolume.coverImage || "");
    setSelectedCoverFile(null);
    setSelectedPdfFile(null);
  }, [existingVolume]);

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes para la portada");
      return;
    }

    if (file.size > MAX_COVER_SIZE) {
      toast.error("La portada no debe superar los 5MB");
      return;
    }

    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setSelectedCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

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

  const removeCoverFile = () => {
    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }
    setSelectedCoverFile(null);
    setCoverPreview(formState.coverImage);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const removePdfFile = () => {
    setSelectedPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const validateForm = () => {
    if (!formState.title.trim()) {
      toast.error("El título es obligatorio");
      return false;
    }
    if (!formState.description.trim()) {
      toast.error("La descripción es obligatoria");
      return false;
    }
    if (!Number.isFinite(formState.volumeNumber) || formState.volumeNumber <= 0) {
      toast.error("El número de volumen debe ser un entero positivo");
      return false;
    }
    if (!Number.isFinite(formState.year) || formState.year < 1900) {
      toast.error("Incluye un año válido");
      return false;
    }
    if (!formState.isPublished && !formState.editorial.trim()) {
      // no-op, editorial optional but we can still allow empty even when published
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let coverStorageId: Id<"_storage"> | undefined;
      let pdfStorageId: Id<"_storage"> | undefined;
      const trimmedTitle = formState.title.trim();
      const trimmedDescription = formState.description.trim();
      const trimmedEditorial = formState.editorial.trim();
      const trimmedCoverImage = formState.coverImage.trim();
      const trimmedPdfUrlInput = formState.pdfUrl.trim();
      const hasStoredCover = Boolean(existingVolume?.storageId);
      const hasStoredPdf = Boolean(existingVolume?.pdfStorageId);
      const existingPdfUrl = (existingVolume?.pdfUrl ?? "").trim();

      if (selectedCoverFile) {
        try {
          coverStorageId = await uploadFile(selectedCoverFile);
        } catch (error) {
          console.error("Failed to upload cover", error);
          toast.error(
            error instanceof Error && error.message
              ? error.message
              : "No se pudo subir la portada"
          );
          return;
        }
      }

      if (selectedPdfFile) {
        try {
          pdfStorageId = await uploadFile(selectedPdfFile);
        } catch (error) {
          console.error("Failed to upload PDF", error);
          toast.error(
            error instanceof Error && error.message
              ? error.message
              : "No se pudo subir el PDF"
          );
          return;
        }
      }

      let coverImage: string | undefined;
      if (selectedCoverFile) {
        coverImage = undefined;
      } else if (!hasStoredCover || !isEditing) {
        coverImage = trimmedCoverImage || undefined;
      }

      let pdfUrl: string | undefined;
      if (selectedPdfFile) {
        pdfUrl = undefined;
      } else if (trimmedPdfUrlInput) {
        if (!hasStoredPdf || trimmedPdfUrlInput !== existingPdfUrl) {
          pdfUrl = trimmedPdfUrlInput;
        }
      } else if (!hasStoredPdf) {
        pdfUrl = "";
      }

      const payload = {
        title: trimmedTitle,
        volumeNumber: formState.volumeNumber,
        year: formState.year,
        description: trimmedDescription,
        editorial: trimmedEditorial || undefined,
        isPublished: formState.isPublished,
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(typeof pdfUrl !== "undefined" ? { pdfUrl } : {}),
        ...(coverStorageId ? { storageId: coverStorageId } : {}),
        ...(pdfStorageId ? { pdfStorageId } : {}),
      };

      if (isEditing && volumeId) {
        await updateVolume({
          id: volumeId as Id<"academic_volumes">,
          ...payload,
        });
        toast.success("Volumen actualizado con éxito");
      } else {
        await createVolume(payload);
        toast.success("Volumen creado con éxito");
      }

      navigate("/panel/extrategia");
    } catch (error) {
      console.error("Failed to save volume", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "No se pudo guardar el volumen";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerTitle = isEditing ? "Editar volumen" : "Nuevo volumen";
  const submitLabel = isSubmitting ? "Guardando..." : "Guardar cambios";

  const isLoadingExisting = isEditing && existingVolume === undefined;

  return (
    <AdminLayout>
      {isLoadingExisting ? (
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
                onClick={() => navigate("/panel/extrategia")}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
                <p className="text-gray-500 text-sm">
                  Define la información principal del volumen académico.
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
              {submitLabel}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
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
                      placeholder="Ej. Pensamiento Estratégico Occidental"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formState.volumeNumber}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            volumeNumber: Number(event.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Año
                      </label>
                      <input
                        type="number"
                        value={formState.year}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            year: Number(event.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                    placeholder="Resumen del volumen y temas destacados..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Editorial (opcional)
                  </label>
                  <textarea
                    value={formState.editorial}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, editorial: event.target.value }))
                    }
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/30 focus:border-[var(--color-brand-primary)]"
                    placeholder="Texto editorial de la edición..."
                  />
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-[var(--color-brand-primary)]" />
                  PDF del volumen
                </h3>
                <p className="text-sm text-gray-500">
                  Sube el PDF completo del volumen o proporciona un enlace externo.
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <input
                      type="text"
                      value={formState.pdfUrl}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, pdfUrl: event.target.value }))
                      }
                      placeholder="https://..."
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]"
                    />
                    <span className="text-xs uppercase text-gray-400 font-semibold">
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
                            onClick={removePdfFile}
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
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-[var(--color-brand-primary)]" />
                  Portada del volumen
                </h3>
                <div
                  className="rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--color-brand-primary)] transition cursor-pointer overflow-hidden bg-gray-50"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Portada"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <Upload size={28} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
                      <Upload size={28} />
                      <span className="text-sm font-medium">
                        Haz clic para cargar la portada
                      </span>
                      <span className="text-xs text-gray-400">
                        Formatos .jpg, .png, máximo 5MB
                      </span>
                    </div>
                  )}
                </div>
                {selectedCoverFile && (
                  <button
                    type="button"
                    onClick={removeCoverFile}
                    className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                    Quitar archivo cargado
                  </button>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Estado de publicación</h3>
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-[var(--color-brand-primary)]/60 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isPublished}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, isPublished: event.target.checked }))
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Publicar volumen en el sitio
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Al publicarlo, el volumen estará disponible en la página pública de EXTRATEGIA.
                    </p>
                  </div>
                </label>
              </section>
            </div>
          </div>
        </motion.form>
      )}
    </AdminLayout>
  );
};

export const VolumeEditor: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="editor">
      <VolumeEditorContent />
    </ProtectedRoute>
  );
};

