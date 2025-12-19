import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Types adapted to Convex
export interface User {
  _id: Id<"users">;
  id: string; // Keeping for compatibility, mapped from _id
  name: string;
  email: string;
  role: "admin" | "editor" | "lector";
  createdAt: string;
  lastLogin: string;
  articlesPublished?: number;
}

export type ArticleStatus = 'draft' | 'scheduled' | 'published';
export type ArticleSource = 'internal' | 'external';

export interface NewsArticle {
  _id: Id<"articles">;
  id: string;
  title: string;
  section: string;
  imageUrl: string;
  description: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  featured: boolean;
  publishDate?: string;
  views?: number;
  status?: ArticleStatus;
  source?: ArticleSource;
}

export interface Comment {
  _id: Id<"comments">;
  id: Id<"comments">;
  articleId: Id<"articles">;
  articleTitle?: string; // Need to fetch separately or join
  author: string;
  email: string;
  content: string;
  date: string;
  status: "pending" | "approved" | "rejected";
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

export interface ReaderDistribution {
  guest: number;
  registered: number;
  total: number;
  sampleSize: number;
  windowDays: number;
}

export interface ReadingTimeStats {
  averageSeconds: number | null;
  medianSeconds: number | null;
  p90Seconds: number | null;
  completionRate: number | null;
  sampleSize: number;
  windowDays: number;
}

export interface ShareMetrics {
  totalShares: number;
  shareRate: number | null;
  sampleSize: number;
  windowDays: number;
  channels: Array<{ channel: string; count: number }>;
}

export interface Analytics {
  totalViews: number;
  totalArticles: number;
  totalUsers: number;
  publishedToday: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsLastMonth: number;
  monthlyViewGrowth: number | null;
  topArticles: Array<{ id: string; title: string; views: number }>;
  viewsBySection: Record<string, number>;
  viewsByDay: Array<{ date: string; views: number }>;
  readerDistribution: ReaderDistribution;
  readingTime: ReadingTimeStats;
  shareMetrics: ShareMetrics;
  viewsAreEstimated: boolean;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  type?: 'article' | 'user' | 'settings' | 'comment';
}

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "lector";
};

interface AdminContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Users
  users: User[];
  addUser: (user: CreateUserInput) => Promise<Id<"users">>;
  updateUser: (id: string, updates: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  userCreationStatus: AsyncStatus;
  userCreationError: string | null;
  resetUserCreationStatus: () => void;

  // Articles
  articles: NewsArticle[];
  addArticle: (article: any) => Promise<void>;
  updateArticle: (id: string, updates: Partial<NewsArticle>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  publishArticle: (id: string) => Promise<void>;
  unpublishArticle: (id: string) => Promise<void>;

  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;

  // Analytics
  analytics: Analytics;

  // Activity Log
  activityLog: ActivityLogEntry[];
  addActivityLog: (entry: any) => void;
  isActivityLogLoading: boolean;

  // Comments (for moderation)
  comments: Comment[];
  isCommentsLoading: boolean;
  approveComment: (id: Id<"comments">) => Promise<void>;
  rejectComment: (id: Id<"comments">) => Promise<void>;
  deleteComment: (id: Id<"comments">) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Default settings for fallback
const defaultSiteSettings: SiteSettings = {
  siteName: 'PDP Diario Digital',
  siteDescription: 'Tu fuente confiable de información',
  logo: '',
  favicon: '',
  primaryColor: '#7C348A',
  secondaryColor: '#033F4A',
  facebookUrl: '',
  twitterUrl: 'https://x.com/pdp_diario?s=21',
  instagramUrl: 'https://www.instagram.com/pdp.diario?igsh=MTgxbXp0enBhOTR0Mw==',
  youtubeUrl: '',
  contactEmail: 'contacto@pdp.com',
  articlesPerPage: 10,
  enableComments: true,
  moderateComments: true,
  googleAnalyticsId: '',
  enableNewsletter: true
};

const defaultAnalytics: Analytics = {
  totalViews: 0,
  totalArticles: 0,
  totalUsers: 0,
  publishedToday: 0,
  viewsToday: 0,
  viewsThisWeek: 0,
  viewsThisMonth: 0,
  viewsLastMonth: 0,
  monthlyViewGrowth: null,
  topArticles: [],
  viewsBySection: {},
  viewsByDay: [],
  readerDistribution: {
    guest: 0,
    registered: 0,
    total: 0,
    sampleSize: 0,
    windowDays: 30,
  },
  readingTime: {
    averageSeconds: null,
    medianSeconds: null,
    p90Seconds: null,
    completionRate: null,
    sampleSize: 0,
    windowDays: 30,
  },
  shareMetrics: {
    totalShares: 0,
    shareRate: null,
    sampleSize: 0,
    windowDays: 30,
    channels: [],
  },
  viewsAreEstimated: false
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Convex Hooks
  const convexUsers = useQuery(api.users.getAll);
  const convexArticles = useQuery(api.articles.getAll);
  const convexComments = useQuery(api.comments.getAll);
  const convexActivityLogs = useQuery(api.activity_logs.getLogs);
  const analyticsStats = useQuery(api.analytics.getDashboardStats);

  const loginMutation = useMutation(api.users.login);
  const createUserMutation = useMutation(api.users.createUser);
  const updateUserMutation = useMutation(api.users.update);
  const deleteUserMutation = useMutation(api.users.remove);

  const createArticleMutation = useMutation(api.articles.create);
  const updateArticleMutation = useMutation(api.articles.update);
  const deleteArticleMutation = useMutation(api.articles.remove);

  const moderateCommentMutation = useMutation(api.comments.moderate);
  const deleteCommentMutation = useMutation(api.comments.remove);

  // Local State for Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userCreationStatus, setUserCreationStatus] = useState<AsyncStatus>('idle');
  const [userCreationError, setUserCreationError] = useState<string | null>(null);

  // Restore session
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = localStorage.getItem('pdp_current_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser) as User;
          setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to restore admin session', error);
        localStorage.removeItem('pdp_current_user');
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Adapters
  const users: User[] = useMemo(() => {
    return (convexUsers ?? []).map(({ password: _password, ...user }) => ({
      ...user,
      id: user._id,
    }));
  }, [convexUsers]);

  const articles: NewsArticle[] = useMemo(() => {
    return (convexArticles ?? []).filter((a): a is NonNullable<typeof a> => a !== null).map(a => ({ ...a, id: a._id }));
  }, [convexArticles]);

  const comments: Comment[] = useMemo(() => {
    if (!convexComments) return [];
    return convexComments.map(c => {
      const article = articles.find(a => a.id === c.articleId);
      return {
        ...c,
        id: c._id,
        articleTitle: article?.title || 'Unknown Article',
        status: c.status as 'pending' | 'approved' | 'rejected',
      };
    });
  }, [convexComments, articles]);

  const isCommentsLoading = convexComments === undefined;

  const activityLog: ActivityLogEntry[] = useMemo(() => {
    if (!convexActivityLogs) return [];

    return convexActivityLogs.map(log => {
      const type: ActivityLogEntry['type'] = log.action.startsWith('article')
        ? 'article'
        : log.action.startsWith('user')
          ? 'user'
          : log.action.startsWith('comment')
            ? 'comment'
            : 'settings';

      const matchedUser = users.find(user => user._id === log.userId);

      return {
        id: log._id,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
        userId: log.userId ?? undefined,
        userName: matchedUser?.name ?? (log.userId ?? 'Sistema'),
        type,
      };
    });
  }, [convexActivityLogs, users]);

  const isActivityLogLoading = convexActivityLogs === undefined;

  const analytics = useMemo<Analytics>(() => {
    if (analyticsStats) {
      return analyticsStats;
    }

    const aggregatedViews = articles.reduce((sum, article) => sum + (article.views ?? 0), 0);

    return {
      ...defaultAnalytics,
      totalArticles: articles.length,
      totalUsers: users.length,
      totalViews: aggregatedViews,
    };
  }, [analyticsStats, articles, users]);

  // Auth Functions
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const user = await loginMutation({ email: email.trim().toLowerCase(), password });
      if (user) {
        const userObj = { ...user, id: user._id } as User;
        setCurrentUser(userObj);
        localStorage.setItem('pdp_current_user', JSON.stringify(userObj));
        return true;
      }
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pdp_current_user');
    setIsAuthLoading(false);
  };

  // User Functions
  const addUser = async (userData: CreateUserInput) => {
    setUserCreationStatus('loading');
    setUserCreationError(null);
    try {
      const userId = await createUserMutation(userData);
      setUserCreationStatus('success');
      return userId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el usuario';
      setUserCreationStatus('error');
      setUserCreationError(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  const updateUser = async (id: string, updates: Partial<User> & { password?: string }) => {
    const {
      _id: _ignoreConvexId,
      id: _ignoreLegacyId,
      createdAt: _ignoreCreatedAt,
      lastLogin: _ignoreLastLogin,
      ...rest
    } = updates as Record<string, unknown>;

    const payload: {
      name?: string;
      role?: User['role'];
      email?: string;
      password?: string;
    } = {};

    if (rest.name !== undefined) {
      payload.name = rest.name as string;
    }

    if (rest.role !== undefined) {
      payload.role = rest.role as User['role'];
    }

    if (rest.email !== undefined) {
      payload.email = rest.email as string;
    }

    if (rest.password !== undefined) {
      payload.password = rest.password as string;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    await updateUserMutation({ id: id as Id<"users">, ...payload });
  };

  const deleteUser = async (id: string) => {
    await deleteUserMutation({ id: id as Id<"users"> });
  };

  // Keep the session user in sync with backend updates
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (!convexUsers) {
      return;
    }

    const latestRecord = convexUsers.find((user) => user._id === currentUser._id);

    if (!latestRecord) {
      setCurrentUser(null);
      localStorage.removeItem('pdp_current_user');
      return;
    }

    const { password: _password, ...latestWithoutPassword } = latestRecord;
    const syncedUser = {
      ...latestWithoutPassword,
      id: latestRecord._id,
    } as User;

    const hasDifference =
      currentUser.name !== syncedUser.name ||
      currentUser.email !== syncedUser.email ||
      currentUser.role !== syncedUser.role ||
      currentUser.lastLogin !== syncedUser.lastLogin;

    if (hasDifference) {
      setCurrentUser(syncedUser);
      localStorage.setItem('pdp_current_user', JSON.stringify(syncedUser));
    }
  }, [convexUsers, currentUser]);

  // Article Functions
  const addArticle = async (articleData: any) => {
    await createArticleMutation(articleData);
  };

  const updateArticle = async (id: string, updates: Partial<NewsArticle>) => {
    const { _id, id: _, ...cleanUpdates } = updates as any;
    await updateArticleMutation({ id: id as Id<"articles">, ...cleanUpdates });
  };

  const deleteArticle = async (id: string) => {
    await deleteArticleMutation({ id: id as Id<"articles"> });
  };

  const publishArticle = async (id: string) => {
    await updateArticleMutation({
      id: id as Id<"articles">,
      featured: true,
      publishDate: new Date().toISOString(),
      status: 'published',
      source: 'internal'
    });
  };

  const unpublishArticle = async (id: string) => {
    await updateArticleMutation({
      id: id as Id<"articles">,
      featured: false,
      status: 'draft'
    });
  };

  // Comment Functions
  const approveComment = async (id: Id<"comments">) => {
    await moderateCommentMutation({ id, status: "approved" });
  };

  const rejectComment = async (id: Id<"comments">) => {
    await moderateCommentMutation({ id, status: "rejected" });
  };

  const deleteComment = async (id: Id<"comments">) => {
    await deleteCommentMutation({ id });
  };

  // Settings
  const convexSettings = useQuery(api.settings.get);
  const updateSettingsMutation = useMutation(api.settings.update);

  const siteSettings = convexSettings ? { ...defaultSiteSettings, ...convexSettings } : defaultSiteSettings;

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    // Optimistic update or just wait for re-fetch
    // We need to pass ALL settings to the mutation because it expects them, 
    // or we should update the mutation to accept partials.
    // The current mutation in convex/settings.ts expects ALL fields.
    // Let's assume we pass the merged object.
    const newSettings = { ...siteSettings, ...updates };

    // We need to map the interface to the args expected by the mutation
    // The mutation args match the SiteSettings interface mostly.
    // We need to ensure we don't pass extra fields if any.
    await updateSettingsMutation({
      siteName: newSettings.siteName,
      siteDescription: newSettings.siteDescription,
      contactEmail: newSettings.contactEmail,
      primaryColor: newSettings.primaryColor,
      secondaryColor: newSettings.secondaryColor,
      facebookUrl: newSettings.facebookUrl,
      twitterUrl: newSettings.twitterUrl,
      instagramUrl: newSettings.instagramUrl,
      youtubeUrl: newSettings.youtubeUrl,
      enableComments: newSettings.enableComments,
      moderateComments: newSettings.moderateComments,
      enableNewsletter: newSettings.enableNewsletter,
    });
  };

  const addActivityLog = (entry: any) => {
    // In real app, push to Convex
    console.log("Log:", entry);
  };

  const resetUserCreationStatus = () => {
    setUserCreationStatus('idle');
    setUserCreationError(null);
  };

  const value: AdminContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAuthLoading,
    login,
    logout,
    users,
    addUser,
    updateUser,
    deleteUser,
    userCreationStatus,
    userCreationError,
    resetUserCreationStatus,
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
    isActivityLogLoading,
    comments,
    isCommentsLoading,
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
