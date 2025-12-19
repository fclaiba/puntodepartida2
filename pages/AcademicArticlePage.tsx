import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Calendar, FileText, Download, User } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface AcademicVolume {
  _id: Id<"academic_volumes">;
  title: string;
  volumeNumber: number;
  year: number;
  description: string;
  editorial?: string;
  pdfUrl?: string;
  coverImage?: string;
  isPublished: boolean;
}

interface AcademicArticle {
  _id: Id<"academic_articles">;
  volumeId: Id<"academic_volumes">;
  title: string;
  author: string;
  abstract: string;
  pageRange?: string;
  pdfUrl?: string;
}

const splitParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const AcademicArticlePage: React.FC = () => {
  const { volumeId, articleId } = useParams<{ volumeId: string; articleId: string }>();

  const volumeQueryArgs = volumeId ? ({ id: volumeId } as { id: Id<"academic_volumes"> }) : "skip";
  const articleQueryArgs = articleId ? ({ id: articleId } as { id: Id<"academic_articles"> }) : "skip";
  const articlesByVolumeArgs = volumeId
    ? ({ volumeId } as { volumeId: Id<"academic_volumes"> })
    : "skip";

  const volume = useQuery(api.academic.getVolumeById, volumeQueryArgs) as
    | AcademicVolume
    | null
    | undefined;
  const article = useQuery(api.academic.getArticleById, articleQueryArgs) as
    | AcademicArticle
    | null
    | undefined;
  const articlesInVolume = useQuery(api.academic.getArticlesByVolume, articlesByVolumeArgs) as
    | AcademicArticle[]
    | undefined;

  const isLoading =
    volume === undefined || article === undefined || articlesInVolume === undefined;

  if (!volumeId || !articleId) {
    return <Navigate to="/extrategia" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!volume || !article || !volume.isPublished || article.volumeId !== volume._id) {
    return <Navigate to="/extrategia" replace />;
  }

  const articles = Array.isArray(articlesInVolume) ? articlesInVolume : [];
  const otherArticles = articles.filter((item) => item._id !== article._id);

  const descriptionParagraphs = splitParagraphs(volume.description);
  const editorialParagraphs = volume.editorial ? splitParagraphs(volume.editorial) : [];
  const volumePdfUrl = volume.pdfUrl;
  const articlePdfUrl = article.pdfUrl;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/extrategia" className="hover:text-[var(--color-brand-primary)] transition-colors">
              EXTRATEGIA
            </Link>
            <span>/</span>
            <span className="text-gray-900">{volume.title}</span>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </div>
          <Link
            to="/extrategia"
            className="inline-flex items-center gap-2 text-sm hover:text-[var(--color-brand-primary)] transition-colors font-semibold"
          >
            <ArrowLeft size={16} />
            Volver a EXTRATEGIA
          </Link>
        </div>
      </div>

      <div
        className="relative py-12 md:py-16 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)",
        }}
      >
        <div className="container mx-auto px-5 md:px-10 lg:px-[60px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <div className="mb-6 flex justify-center">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                <BookOpen size={16} />
                Volumen {volume.volumeNumber} • {volume.title}
              </span>
            </div>

            <h1
              className="mb-6"
              style={{
                fontSize: "clamp(28px, 6vw, 48px)",
                fontWeight: 800,
                lineHeight: "1.2",
                letterSpacing: "-0.01em",
              }}
            >
              {article.title}
            </h1>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>
                <User size={18} />
                {article.author}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Publicado en {volume.year}</span>
              </div>
              {article.pageRange && (
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Páginas {article.pageRange}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-5 md:px-10 lg:px-[60px] py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 p-8 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(124, 52, 138, 0.05) 0%, rgba(3, 63, 74, 0.05) 100%)",
              border: "2px solid rgba(124, 52, 138, 0.1)",
            }}
          >
            <h2
              className="mb-4"
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--color-brand-primary)",
              }}
            >
              RESUMEN
            </h2>
            <p className="text-gray-700 mb-6" style={{ fontSize: "16px", lineHeight: "1.8" }}>
              {article.abstract}
            </p>

            {articlePdfUrl ? (
              <a
                href={articlePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--color-brand-primary)",
                  color: "white",
                }}
              >
                <Download size={16} />
                Descargar PDF del artículo
              </a>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500">
                El PDF del artículo estará disponible próximamente.
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2
              className="mb-6 pb-3 border-b-2"
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--color-brand-primary)",
                borderColor: "rgba(124, 52, 138, 0.2)",
              }}
            >
              Sobre este volumen
            </h2>
            <div className="space-y-5 text-gray-800" style={{ fontSize: "17px", lineHeight: "1.9" }}>
              {descriptionParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </motion.section>

          {editorialParagraphs.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12 p-8 rounded-2xl bg-gray-50 border border-gray-200"
            >
              <h2
                className="mb-4"
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--color-brand-primary)",
                }}
              >
                Editorial del volumen
              </h2>
              <div className="space-y-4 text-gray-700" style={{ fontSize: "16px", lineHeight: "1.8" }}>
                {editorialParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </motion.section>
          )}

          {volumePdfUrl && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-8 rounded-2xl text-center"
              style={{
                background: "linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)",
              }}
            >
              <BookOpen size={48} className="mx-auto mb-4 text-white" />
              <h3 className="mb-3 text-white" style={{ fontSize: "24px", fontWeight: 800 }}>
                Descargá el volumen completo
              </h3>
              <p className="mb-6 text-white/90" style={{ fontSize: "15px" }}>
                Accedé a todos los artículos publicados en este número de EXTRATEGIA en formato PDF.
              </p>
              <a
                href={volumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "white",
                  color: "var(--color-brand-primary)",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                <Download size={20} />
                Descargar volumen en PDF
              </a>
              <p className="mt-3 text-white/70 text-xs">
                Volumen {volume.volumeNumber} • {articles.length} artículos incluidos
              </p>
            </motion.section>
          )}

          {otherArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <h3
                className="mb-6"
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--color-brand-primary)",
                }}
              >
                Más artículos de este volumen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherArticles.map((otherArticle) => (
                  <Link
                    key={otherArticle._id}
                    to={`/extrategia/${volume._id}/${otherArticle._id}`}
                    className="block p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: "var(--color-brand-primary)",
                          color: "white",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        <BookOpen size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="mb-2 group-hover:text-[var(--color-brand-primary)] transition-colors"
                          style={{ fontSize: "16px", fontWeight: 700, lineHeight: "1.4" }}
                        >
                          {otherArticle.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{otherArticle.author}</p>
                        {otherArticle.pageRange && (
                          <p className="text-gray-500 text-xs mt-1">Páginas {otherArticle.pageRange}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
};
