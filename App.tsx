import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { SearchPage } from './pages/SearchPage';
import { SavedArticlesPage } from './pages/SavedArticlesPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AboutPage } from './pages/AboutPage';
import { ExtrateguiaPage } from './pages/ExtrateguiaPage';
import { AcademicArticlePage } from './pages/AcademicArticlePage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ArticleList } from './pages/admin/ArticleList';
import { ArticleEditor } from './pages/admin/ArticleEditor';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminSettings } from './pages/admin/AdminSettings';
import { CommentModeration } from './pages/admin/CommentModeration';
import { Analytics } from './pages/admin/Analytics';
import { ActivityLog } from './pages/admin/ActivityLog';
import { AdsManager } from './pages/admin/AdsManager';
import { NewslettersManager } from './pages/admin/NewslettersManager';
import { Toaster } from './components/ui/sonner';
import { AdminProvider } from './contexts/AdminContext';
import { VolumeList } from './pages/admin/academic/VolumeList';
import { VolumeEditor } from './pages/admin/academic/VolumeEditor';
import { AcademicArticleEditor } from './pages/admin/academic/AcademicArticleEditor';

function App() {

  return (
    <AdminProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          {/* Admin Routes - Sin Header/Footer */}
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/panel/login" element={<AdminLogin />} />
          <Route path="/panel" element={<AdminDashboard />} />
          <Route path="/panel/articles" element={<ArticleList />} />
          <Route path="/panel/articles/new" element={<ArticleEditor />} />
          <Route path="/panel/articles/edit/:id" element={<ArticleEditor />} />
          <Route path="/panel/comments" element={<CommentModeration />} />
          <Route path="/panel/analytics" element={<Analytics />} />
          <Route path="/panel/activity" element={<ActivityLog />} />
          <Route path="/panel/ads" element={<AdsManager />} />
          <Route path="/panel/newsletters" element={<NewslettersManager />} />
          <Route path="/panel/users" element={<UserManagement />} />
          <Route path="/panel/settings" element={<AdminSettings />} />
          <Route path="/panel/extrategia" element={<VolumeList />} />
          <Route path="/panel/extrategia/volumen/nuevo" element={<VolumeEditor />} />
          <Route path="/panel/extrategia/volumen/:volumeId/editar" element={<VolumeEditor />} />
          <Route path="/panel/extrategia/volumen/:volumeId/articulos/nuevo" element={<AcademicArticleEditor />} />
          <Route path="/panel/extrategia/volumen/:volumeId/articulos/:articleId/editar" element={<AcademicArticleEditor />} />

          {/* Public Routes - Con Header/Footer */}
          <Route path="/*" element={
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col transition-colors">
              <Header />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/politica" element={<SectionPage />} />
                  <Route path="/economia" element={<SectionPage />} />
                  <Route path="/internacional" element={<SectionPage />} />
                  <Route path="/local" element={<SectionPage />} />
                  <Route path="/opinion" element={<SectionPage />} />
                  <Route path="/extrategia" element={<ExtrateguiaPage />} />
                  <Route path="/extrategia/:volumeId/:articleId" element={<AcademicArticlePage />} />
                  <Route path="/guardados" element={<SavedArticlesPage />} />
                  <Route path="/mi-perfil" element={<UserProfilePage />} />
                  <Route path="/noticia/:id" element={<NewsDetailPage />} />
                  <Route path="/buscar" element={<SearchPage />} />
                  <Route path="/sobre-nosotros" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
