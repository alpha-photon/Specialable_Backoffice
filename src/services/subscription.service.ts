import api from '../lib/api';

export interface Subscription {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  plan: 'monthly' | 'quarterly' | 'yearly';
  userType: 'doctor' | 'parent';
  amount: number;
  discount: number;
  finalAmount: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanVisibility {
  _id: string;
  userType: 'doctor' | 'parent' | 'all';
  plan: 'monthly' | 'quarterly' | 'yearly';
  isVisible: boolean;
  isDefault: boolean;
  customPrice: number | null;
  customDiscount: number | null;
  description: string;
  order: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  revenue: {
    total: number;
    payments: number;
  };
  planDistribution: Array<{ _id: string; count: number }>;
  userTypeDistribution: Array<{ _id: string; count: number }>;
}

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = async (params?: {
  status?: string;
  userType?: string;
  plan?: string;
  limit?: number;
  skip?: number;
}): Promise<{ subscriptions: Subscription[]; pagination: any }> => {
  const response = await api.get('/admin/subscriptions', { params });
  return {
    subscriptions: response.data.data || [],
    pagination: response.data.pagination || { total: 0, limit: 20, skip: 0, hasMore: false },
  };
};

/**
 * Get subscription statistics
 */
export const getSubscriptionStats = async (): Promise<SubscriptionStats> => {
  const response = await api.get('/admin/subscriptions/stats');
  return response.data.data;
};

/**
 * Get user subscriptions
 */
export const getUserSubscriptions = async (userId: string): Promise<{
  user: any;
  subscriptions: Subscription[];
}> => {
  const response = await api.get(`/admin/subscriptions/user/${userId}`);
  return response.data.data;
};

/**
 * Assign subscription to user
 */
export const assignSubscription = async (data: {
  userId: string;
  plan: 'monthly' | 'quarterly' | 'yearly';
  userType: 'doctor' | 'parent';
  startDate?: string;
  endDate?: string;
  amount?: number;
}): Promise<Subscription> => {
  const response = await api.post('/admin/subscriptions/assign', data);
  return response.data.data;
};

/**
 * Update subscription
 */
export const updateSubscription = async (
  id: string,
  data: {
    plan?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    amount?: number;
    autoRenew?: boolean;
  }
): Promise<Subscription> => {
  const response = await api.put(`/admin/subscriptions/${id}`, data);
  return response.data.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (id: string, reason?: string): Promise<Subscription> => {
  const response = await api.post(`/admin/subscriptions/${id}/cancel`, { reason });
  return response.data.data;
};

/**
 * Get plan visibility settings
 */
export const getPlanVisibility = async (userType?: string): Promise<PlanVisibility[]> => {
  const response = await api.get('/admin/subscriptions/plan-visibility', {
    params: userType ? { userType } : {},
  });
  return response.data.data;
};

/**
 * Create or update plan visibility
 */
export const createPlanVisibility = async (data: {
  userType: 'doctor' | 'parent' | 'all';
  plan: 'monthly' | 'quarterly' | 'yearly';
  isVisible?: boolean;
  isDefault?: boolean;
  customPrice?: number;
  customDiscount?: number;
  description?: string;
  order?: number;
}): Promise<PlanVisibility> => {
  const response = await api.post('/admin/subscriptions/plan-visibility', data);
  return response.data.data;
};

/**
 * Update plan visibility
 */
export const updatePlanVisibility = async (
  id: string,
  data: {
    isVisible?: boolean;
    isDefault?: boolean;
    customPrice?: number;
    customDiscount?: number;
    description?: string;
    order?: number;
  }
): Promise<PlanVisibility> => {
  const response = await api.put(`/admin/subscriptions/plan-visibility/${id}`, data);
  return response.data.data;
};

/**
 * Initialize plan visibility
 */
export const initPlanVisibility = async (): Promise<PlanVisibility[]> => {
  const response = await api.post('/admin/subscriptions/plan-visibility/init');
  return response.data.data;
};

