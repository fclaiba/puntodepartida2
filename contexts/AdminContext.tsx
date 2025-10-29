import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../data/adminData';
import { NewsArticle, initialNewsArticles } from '../data/newsData';

interface AdminContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Articles
  articles: NewsArticle[];
  addArticle: (article: Omit<NewsArticle, 'id'>) => void;
  updateArticle: (id: string, updates: Partial<NewsArticle>) => void;
  deleteArticle: (id: string) => void;
  publishArticle: (id: string) => void;
  unpublishArticle: (id: string) => void;
  
  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  // Analytics
  analytics: Analytics;
  
  // Activity Log
  activityLog: ActivityLogEntry[];
  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  
  // Comments (for moderation)
  comments: Comment[];
  approveComment: (id: string) => void;
  rejectComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  contactEmail: string;
  articlesPerPage: number;
  enableComments: boolean;
  moderateComments: boolean;
  googleAnalyticsId: string;
  enableNewsletter: boolean;
}

export interface Analytics {
  totalViews: number;
  totalArticles: number;
  totalUsers: number;
  publishedToday: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topArticles: Array<{ id: string; title: string; views: number }>;
  viewsBySection: Record<string, number>;
  viewsByDay: Array<{ date: string; views: number }>;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'article' | 'user' | 'settings' | 'comment';
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  author: string;
  email: string;
  content: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'pdp_admin_users',
  ARTICLES: 'pdp_admin_articles',
  CURRENT_USER: 'pdp_current_user',
  SITE_SETTINGS: 'pdp_site_settings',
  ANALYTICS: 'pdp_analytics',
  ACTIVITY_LOG: 'pdp_activity_log',
  COMMENTS: 'pdp_comments'
};

const defaultSiteSettings: SiteSettings = {
  siteName: 'PDP Diario Digital',
  siteDescription: 'Tu fuente confiable de información',
  logo: '',
  favicon: '',
  primaryColor: '#7C348A',
  secondaryColor: '#033F4A',
  facebookUrl: '#',
  twitterUrl: '#',
  instagramUrl: '#',
  youtubeUrl: '#',
  contactEmail: 'contacto@pdp.com',
  articlesPerPage: 10,
  enableComments: true,
  moderateComments: true,
  googleAnalyticsId: '',
  enableNewsletter: true
};

const defaultAnalytics: Analytics = {
  totalViews: 45230,
  totalArticles: 156,
  totalUsers: 5,
  publishedToday: 3,
  viewsToday: 1250,
  viewsThisWeek: 8400,
  viewsThisMonth: 28750,
  topArticles: [],
  viewsBySection: {
    politica: 12500,
    economia: 10200,
    internacional: 8900,
    local: 7600,
    opinion: 4030
  },
  viewsByDay: []
};

// Initial mock users with passwords
const initialUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@pdp.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-15',
    lastLogin: new Date().toISOString(),
    articlesPublished: 45
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria@pdp.com',
    password: 'admin123',
    role: 'editor',
    createdAt: '2024-02-20',
    lastLogin: '2025-10-20',
    articlesPublished: 32
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana@pdp.com',
    password: 'admin123',
    role: 'lector',
    createdAt: '2024-04-05',
    lastLogin: '2025-10-21'
  }
];

const initialComments: Comment[] = [
  {
    id: '1',
    articleId: '1',
    articleTitle: 'Crisis política: Nuevas medidas económicas generan debate',
    author: 'Pedro Gómez',
    email: 'pedro@email.com',
    content: 'Excelente análisis de la situación actual. Es importante que se discutan estas medidas.',
    date: '2025-10-21T10:30:00',
    status: 'pending'
  },
  {
    id: '2',
    articleId: '1',
    articleTitle: 'Crisis política: Nuevas medidas económicas generan debate',
    author: 'Laura Silva',
    email: 'laura@email.com',
    content: 'No estoy de acuerdo con las medidas propuestas. Creo que van a afectar negativamente.',
    date: '2025-10-21T11:15:00',
    status: 'pending'
  },
  {
    id: '3',
    articleId: '2',
    articleTitle: 'Cumbre internacional aborda el cambio climático',
    author: 'Miguel Torres',
    email: 'miguel@email.com',
    content: 'Es urgente que se tomen medidas reales contra el cambio climático.',
    date: '2025-10-21T09:45:00',
    status: 'approved'
  }
];

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password: string })[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [analytics, setAnalytics] = useState<Analytics>(defaultAnalytics);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Initialize data from localStorage
  useEffect(() => {
    // Load current user
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Load users or initialize with default
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(initialUsers);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    }

    // Load articles or initialize with default
    const savedArticles = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      setArticles(initialNewsArticles);
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(initialNewsArticles));
    }

    // Load site settings
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS);
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    } else {
      localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(defaultSiteSettings));
    }

    // Load analytics
    const savedAnalytics = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (savedAnalytics) {
      setAnalytics(JSON.parse(savedAnalytics));
    } else {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(defaultAnalytics));
    }

    // Load activity log
    const savedLog = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    if (savedLog) {
      setActivityLog(JSON.parse(savedLog));
    }

    // Load comments
    const savedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(initialComments));
    }
  }, []);

  // Persist users to localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }, [users]);

  // Persist articles to localStorage and notify
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('articles-updated'));
    }
  }, [articles]);

  // Persist site settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS, JSON.stringify(siteSettings));
  }, [siteSettings]);

  // Persist analytics
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  }, [analytics]);

  // Persist activity log
  useEffect(() => {
    if (activityLog.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(activityLog));
    }
  }, [activityLog]);

  // Persist comments
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      const updatedUser = {
        ...userWithoutPassword,
        lastLogin: new Date().toISOString()
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      
      // Update user's last login
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, lastLogin: updatedUser.lastLogin } : u
      ));

      // Add activity log
      addActivityLog({
        userId: user.id,
        userName: user.name,
        action: 'Inicio de sesión',
        details: `${user.name} inició sesión en el sistema`,
        type: 'user'
      });
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addActivityLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'Cierre de sesión',
        details: `${currentUser.name} cerró sesión`,
        type: 'user'
      });
    }
    
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      password: 'changeme123' // Default password
    };
    
    setUsers(prev => [...prev, newUser]);
    
    addActivityLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || 'Sistema',
      action: 'Usuario creado',
      details: `Se creó el usuario ${userData.name} (${userData.email})`,
      type: 'user'
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
    
    const user = users.find(u => u.id === id);
    if (user) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Usuario actualizado',
        details: `Se actualizó el usuario ${user.name}`,
        type: 'user'
      });
    }
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));
    
    if (user) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Usuario eliminado',
        details: `Se eliminó el usuario ${user.name}`,
        type: 'user'
      });
    }
  };

  const addArticle = (articleData: Omit<NewsArticle, 'id'>) => {
    const newArticle: NewsArticle = {
      ...articleData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    setArticles(prev => [...prev, newArticle]);
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      totalArticles: prev.totalArticles + 1,
      publishedToday: prev.publishedToday + 1
    }));
    
    addActivityLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || 'Sistema',
      action: 'Artículo creado',
      details: `Se creó el artículo "${articleData.title}"`,
      type: 'article'
    });
  };

  const updateArticle = (id: string, updates: Partial<NewsArticle>) => {
    setArticles(prev => prev.map(article => 
      article.id === id ? { ...article, ...updates } : article
    ));
    
    const article = articles.find(a => a.id === id);
    if (article) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Artículo actualizado',
        details: `Se actualizó el artículo "${article.title}"`,
        type: 'article'
      });
    }
  };

  const deleteArticle = (id: string) => {
    const article = articles.find(a => a.id === id);
    setArticles(prev => prev.filter(article => article.id !== id));
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      totalArticles: Math.max(0, prev.totalArticles - 1)
    }));
    
    if (article) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Artículo eliminado',
        details: `Se eliminó el artículo "${article.title}"`,
        type: 'article'
      });
    }
  };

  const publishArticle = (id: string) => {
    updateArticle(id, { featured: true, publishDate: new Date().toISOString() });
  };

  const unpublishArticle = (id: string) => {
    updateArticle(id, { featured: false });
  };

  const updateSiteSettings = (updates: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...updates }));
    
    addActivityLog({
      userId: currentUser?.id || '',
      userName: currentUser?.name || 'Sistema',
      action: 'Configuración actualizada',
      details: 'Se actualizaron las configuraciones del sitio',
      type: 'settings'
    });
  };

  const addActivityLog = (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setActivityLog(prev => [newEntry, ...prev].slice(0, 100)); // Keep last 100 entries
  };

  const approveComment = (id: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === id ? { ...comment, status: 'approved' as const } : comment
    ));
    
    const comment = comments.find(c => c.id === id);
    if (comment) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Comentario aprobado',
        details: `Se aprobó un comentario en "${comment.articleTitle}"`,
        type: 'comment'
      });
    }
  };

  const rejectComment = (id: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === id ? { ...comment, status: 'rejected' as const } : comment
    ));
    
    const comment = comments.find(c => c.id === id);
    if (comment) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Comentario rechazado',
        details: `Se rechazó un comentario en "${comment.articleTitle}"`,
        type: 'comment'
      });
    }
  };

  const deleteComment = (id: string) => {
    const comment = comments.find(c => c.id === id);
    setComments(prev => prev.filter(c => c.id !== id));
    
    if (comment) {
      addActivityLog({
        userId: currentUser?.id || '',
        userName: currentUser?.name || 'Sistema',
        action: 'Comentario eliminado',
        details: `Se eliminó un comentario en "${comment.articleTitle}"`,
        type: 'comment'
      });
    }
  };

  const value: AdminContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    users: users.map(({ password, ...user }) => user),
    addUser,
    updateUser,
    deleteUser,
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    siteSettings,
    updateSiteSettings,
    analytics,
    activityLog,
    addActivityLog,
    comments,
    approveComment,
    rejectComment,
    deleteComment
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
