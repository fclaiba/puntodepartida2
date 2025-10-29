import { useState, useEffect } from 'react';
import { NewsArticle, initialNewsArticles } from '../data/newsData';

export const useArticles = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    // Load articles from localStorage (where admin saves them)
    const loadArticles = () => {
      const stored = localStorage.getItem('pdp_admin_articles');
      if (stored) {
        try {
          const parsedArticles = JSON.parse(stored);
          // Filter out extrategia articles as they're handled separately
          setArticles(parsedArticles.filter((a: NewsArticle) => a.section !== 'extrategia'));
        } catch (error) {
          console.error('Error loading articles:', error);
          setArticles(initialNewsArticles);
        }
      } else {
        // Initialize with default articles
        setArticles(initialNewsArticles);
        localStorage.setItem('pdp_admin_articles', JSON.stringify(initialNewsArticles));
      }
    };

    loadArticles();

    // Listen for storage changes (when admin updates articles)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pdp_admin_articles') {
        loadArticles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomUpdate = () => {
      loadArticles();
    };
    
    window.addEventListener('articles-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('articles-updated', handleCustomUpdate);
    };
  }, []);

  return articles;
};
