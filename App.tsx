import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { SearchPage } from './pages/SearchPage';
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
import { Toaster } from './components/ui/sonner';
import { AdminProvider } from './contexts/AdminContext';
import { initializeNewsData } from './data/newsData';

function App() {
  useEffect(() => {
    // Initialize news data on first load
    initializeNewsData();
  }, []);

  return (
    <AdminProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
        {/* Admin Routes - Sin Header/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/articles" element={<ArticleList />} />
        <Route path="/admin/articles/new" element={<ArticleEditor />} />
        <Route path="/admin/articles/edit/:id" element={<ArticleEditor />} />
        <Route path="/admin/comments" element={<CommentModeration />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/activity" element={<ActivityLog />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Public Routes - Con Header/Footer */}
        <Route path="/*" element={
          <div className="min-h-screen bg-white flex flex-col">
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
