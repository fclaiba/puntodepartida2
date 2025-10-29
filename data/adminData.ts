export type UserRole = 'lector' | 'editor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  articlesPublished?: number;
}

export interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalViews: number;
  publishedToday: number;
  articlesThisMonth: number;
  activeUsers: number;
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@pdp.com',
    role: 'admin',
    createdAt: '2024-01-15',
    lastLogin: '2025-10-21',
    articlesPublished: 45
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria@pdp.com',
    role: 'editor',
    createdAt: '2024-02-20',
    lastLogin: '2025-10-20',
    articlesPublished: 32
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos@pdp.com',
    role: 'editor',
    createdAt: '2024-03-10',
    lastLogin: '2025-10-19',
    articlesPublished: 28
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@pdp.com',
    role: 'lector',
    createdAt: '2024-04-05',
    lastLogin: '2025-10-21'
  },
  {
    id: '5',
    name: 'Luis Fernández',
    email: 'luis@pdp.com',
    role: 'lector',
    createdAt: '2024-05-12',
    lastLogin: '2025-10-20'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalArticles: 156,
  totalUsers: 5,
  totalViews: 45230,
  publishedToday: 3,
  articlesThisMonth: 28,
  activeUsers: 4
};

// Auth helper functions
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('pdp_current_user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('pdp_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('pdp_current_user');
  }
};

export const hasPermission = (user: User | null, requiredRole: UserRole): boolean => {
  if (!user) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    'lector': 1,
    'editor': 2,
    'admin': 3
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '#7C348A';
    case 'editor':
      return '#033F4A';
    case 'lector':
      return '#6B7280';
  }
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'editor':
      return 'Editor';
    case 'lector':
      return 'Lector';
  }
};
