import api from '../lib/api';

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const getAnalytics = async (days?: number) => {
  const response = await api.get('/admin/dashboard/analytics', { params: { days } });
  return response.data;
};

// Users
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  blocked?: string;
}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<any>) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const blockUser = async (id: string) => {
  const response = await api.put(`/admin/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id: string) => {
  const response = await api.put(`/admin/users/${id}/unblock`);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// Posts
export const getAllPosts = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/posts', { params });
  return response.data;
};

export const approvePost = async (id: string, notes?: string) => {
  const response = await api.put(`/admin/posts/${id}/approve`, { notes });
  return response.data;
};

export const rejectPost = async (id: string, reason?: string) => {
  const response = await api.put(`/admin/posts/${id}/reject`, { reason });
  return response.data;
};

export const deletePost = async (id: string) => {
  const response = await api.delete(`/admin/posts/${id}`);
  return response.data;
};

// Comments
export const getAllComments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get('/admin/comments', { params });
  return response.data;
};

export const approveComment = async (id: string) => {
  const response = await api.put(`/admin/comments/${id}/approve`);
  return response.data;
};

export const rejectComment = async (id: string) => {
  const response = await api.put(`/admin/comments/${id}/reject`);
  return response.data;
};

export const deleteComment = async (id: string) => {
  const response = await api.delete(`/admin/comments/${id}`);
  return response.data;
};

// Chat
export const getAllChatRooms = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/admin/chat/rooms', { params });
  return response.data;
};

export const getAllChatMessages = async (params?: {
  page?: number;
  limit?: number;
  roomId?: string;
  flagged?: string;
}) => {
  const response = await api.get('/admin/chat/messages', { params });
  return response.data;
};

export const getFlaggedMessages = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/admin/chat/flagged', { params });
  return response.data;
};

export const deleteChatMessage = async (id: string) => {
  const response = await api.delete(`/admin/chat/messages/${id}`);
  return response.data;
};

// Appointments
export const getAllAppointments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get('/admin/appointments', { params });
  return response.data;
};

// Children
export const getAllChildren = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/admin/children', { params });
  return response.data;
};

// Chat Rooms
export const createChatRoom = async (data: {
  name: string;
  slug?: string;
  description?: string;
  topicDescription?: string;
  isPrivate?: boolean;
}) => {
  const response = await api.post('/admin/chat/rooms', data);
  return response.data;
};

export const deleteChatRoom = async (id: string) => {
  const response = await api.delete(`/admin/chat/rooms/${id}`);
  return response.data;
};

// Therapists/Doctors
export const getAllTherapistProfiles = async (params?: {
  page?: number;
  limit?: number;
  isVerified?: string;
  role?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/therapists', { params });
  return response.data;
};

export const getTherapistProfileById = async (id: string) => {
  const response = await api.get(`/admin/therapists/${id}`);
  return response.data;
};

export const verifyTherapistProfile = async (id: string, verificationNotes?: string) => {
  const response = await api.put(`/admin/therapists/${id}/verify`, { verificationNotes });
  return response.data;
};

export const unverifyTherapistProfile = async (id: string, reason?: string) => {
  const response = await api.put(`/admin/therapists/${id}/unverify`, { reason });
  return response.data;
};

// Bulk Operations
export const bulkApprovePosts = async (postIds: string[], notes?: string) => {
  const response = await api.post('/admin/posts/bulk-approve', { postIds, notes });
  return response.data;
};

export const bulkRejectPosts = async (postIds: string[], reason?: string) => {
  const response = await api.post('/admin/posts/bulk-reject', { postIds, reason });
  return response.data;
};

export const bulkApproveComments = async (commentIds: string[]) => {
  const response = await api.post('/admin/comments/bulk-approve', { commentIds });
  return response.data;
};

export const bulkRejectComments = async (commentIds: string[]) => {
  const response = await api.post('/admin/comments/bulk-reject', { commentIds });
  return response.data;
};

export const bulkBlockUsers = async (userIds: string[]) => {
  const response = await api.post('/admin/users/bulk-block', { userIds });
  return response.data;
};

export const bulkUnblockUsers = async (userIds: string[]) => {
  const response = await api.post('/admin/users/bulk-unblock', { userIds });
  return response.data;
};

// Export
export const exportUsers = async (params?: { role?: string; blocked?: string }) => {
  const response = await api.get('/admin/export/users', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export const exportPosts = async (params?: { status?: string }) => {
  const response = await api.get('/admin/export/posts', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
