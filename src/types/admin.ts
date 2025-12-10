export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'therapist' | 'doctor' | 'admin';
  verified: boolean;
  blocked: boolean;
  createdAt: string;
  lastActiveAt: string;
  postsCount?: number;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  views: number;
  likes: number;
  commentsCount: number;
}

export interface Comment {
  _id: string;
  content: string;
  authorId: string;
  authorName: string;
  postId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalAppointments: number;
  totalChildren: number;
  totalChatRooms: number;
  pendingPosts: number;
  pendingComments: number;
  flaggedMessages: number;
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
}

export interface Analytics {
  userGrowth: Array<{ date: string; count: number }>;
  postGrowth: Array<{ date: string; count: number }>;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

