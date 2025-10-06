export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: 'admin' | 'user' | 'moderator';
  profile: {
    bio: string;
    location: string;
    website: string;
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
  };
  stats: {
    loginCount: number;
    lastLoginAt: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: {
    amount: number;
    currency: string;
    discountPercentage?: number;
    originalPrice?: number;
  };
  images: string[];
  specifications: Record<string, string | number | boolean>;
  inventory: {
    stock: number;
    reserved: number;
    available: number;
    lowStockThreshold: number;
  };
  ratings: {
    average: number;
    count: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sku: string;
  }>;
  shipping: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    method: string;
    cost: number;
    estimatedDelivery: string;
    trackingNumber?: string;
  };
  payment: {
    method: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId: string;
    amount: number;
    currency: string;
  };
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Analytics {
  period: string;
  startDate: string;
  endDate: string;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    bounceRate: number;
    pageViews: number;
    uniqueVisitors: number;
  };
  trends: Array<{
    date: string;
    users: number;
    revenue: number;
    orders: number;
    pageViews: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  demographics: {
    ageGroups: Record<string, number>;
    countries: Record<string, number>;
    devices: Record<string, number>;
  };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    readingTime: number;
  };
  featuredImage?: {
    url: string;
    alt: string;
    caption?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: Array<'email' | 'push' | 'sms' | 'in_app'>;
  scheduledFor?: string;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  metadata: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastCheck: string;
    details?: Record<string, any>;
  }>;
  performance: {
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    activeConnections: number;
    maxConnections: number;
  };
}
