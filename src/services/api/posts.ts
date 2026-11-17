import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, SearchParams, ApiResponse } from './config';

// Post interfaces
export interface Post {
  post_id: string;
  user_id: number;
  category_id: number;
  title: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  views_count: number;
  saves_count: number;
  reports_count: number;
  status: number;
  is_featured: number;
  created_date_time: string;
  updated_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    profile_photo: string | null;
  };
  category: {
    category_id: number;
    category_name: string;
    description: string | null;
  };
  comments: PostComment[];
  likes: PostLike[];
  images: PostImage[];
  reports: PostReport[];
}

export interface PostComment {
  comment_id: string;
  post_id: string;
  user_id: number;
  comment: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    profile_photo: string | null;
  };
}

export interface PostLike {
  like_id: string;
  post_id: string;
  user_id: number;
  created_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    profile_photo: string | null;
  };
}

export interface PostImage {
  image_id: string;
  post_id: string;
  image_url: string;
  caption: string | null;
  order_index: number;
  created_date_time: string;
}

export interface PostReport {
  report_id: string;
  post_id: string;
  user_id: number;
  report_type: string;
  reason: string;
  status: number;
  created_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
  };
}

export interface PostStats {
  totalPosts: number;
  activePosts: number;
  inactivePosts: number;
  featuredPosts: number;
  reportedPosts: number;
  postsToday: number;
  postsThisWeek: number;
  postsThisMonth: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalSaves: number;
  averageLikesPerPost: number;
  averageCommentsPerPost: number;
  averageViewsPerPost: number;
  topCategories: Array<{ category_id: number; category_name: string; post_count: number; total_engagement: number }>;
  topUsers: Array<{ user_id: number; full_name: string; post_count: number; total_likes: number; total_comments: number }>;
  engagementRate: number;
}

export interface PostListParams extends PaginationParams, SearchParams {
  userId?: number;
  categoryId?: number;
  status?: number;
  isFeatured?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Posts API class
export class PostsAPI {
  // Get all posts with pagination and filters
  async getAllPosts(params?: PostListParams): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.POSTS.GET_ALL, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch posts');
    }
  }

  // Get posts by user
  async getPostsByUser(userId: number, params?: Omit<PostListParams, 'userId'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.POSTS.GET_BY_USER, { userId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch posts for user ${userId}`);
    }
  }

  // Get posts by category
  async getPostsByCategory(categoryId: number, params?: Omit<PostListParams, 'categoryId'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.POSTS.GET_BY_CATEGORY, { categoryId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch posts for category ${categoryId}`);
    }
  }

  // Get post statistics
  async getPostStatistics(): Promise<ApiResponse<PostStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.POSTS.GET_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch post statistics');
    }
  }

  // Get post by ID
  async getPostById(postId: string): Promise<ApiResponse<Post>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.POSTS.GET_BY_ID, { postId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch post ${postId}`);
    }
  }

  async deleteComment(
    postId: string | number,
    commentId: string | number
  ): Promise<ApiResponse<{ postId: number; commentId: number; deletedCommentIds: number[]; deleted: boolean }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.POSTS.DELETE_COMMENT, {
        postId: String(postId),
        commentId: String(commentId),
      });
      return await apiClient.delete(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to delete comment ${commentId}`);
    }
  }

  // Search posts
  async searchPosts(query: string, params?: Omit<PostListParams, 'search'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ ...params, search: query });
    } catch (error) {
      throw this.handleError(error, 'Failed to search posts');
    }
  }

  // Get posts by status
  async getPostsByStatus(status: number, params?: Omit<PostListParams, 'status'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ ...params, status });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch posts with status ${status}`);
    }
  }

  // Get featured posts
  async getFeaturedPosts(params?: Omit<PostListParams, 'isFeatured'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ ...params, isFeatured: 1 });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch featured posts');
    }
  }

  // Get reported posts
  async getReportedPosts(params?: Omit<PostListParams, 'status'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      const response = await this.getAllPosts(params);
      const reportedPosts = response.data.posts.filter(post => post.reports_count > 0);
      
      return {
        success: true,
        message: 'Reported posts fetched successfully',
        data: {
          posts: reportedPosts,
          stats: response.data.stats
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch reported posts');
    }
  }

  // Get recent posts (last 7 days)
  async getRecentPosts(params?: Omit<PostListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      
      return await this.getAllPosts({ ...params, dateFrom, dateTo: today });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent posts');
    }
  }

  // Get today's posts
  async getTodaysPosts(params?: Omit<PostListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getAllPosts({ ...params, dateFrom: today, dateTo: today });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch today\'s posts');
    }
  }

  // Get top categories
  async getTopCategories(limit: number = 10): Promise<ApiResponse<{ categories: Array<{ category_id: number; category_name: string; post_count: number; total_engagement: number }> }>> {
    try {
      const response = await this.getPostStatistics();
      return {
        success: true,
        message: 'Top categories fetched successfully',
        data: {
          categories: response.data.topCategories.slice(0, limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top categories');
    }
  }

  // Get top users by posts
  async getTopUsersByPosts(limit: number = 10): Promise<ApiResponse<{ users: Array<{ user_id: number; full_name: string; post_count: number; total_likes: number; total_comments: number }> }>> {
    try {
      const response = await this.getPostStatistics();
      return {
        success: true,
        message: 'Top users by posts fetched successfully',
        data: {
          users: response.data.topUsers.slice(0, limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top users by posts');
    }
  }

  // Get most liked posts
  async getMostLikedPosts(limit: number = 10): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ 
        limit, 
        sortBy: 'likes_count', 
        sortOrder: 'desc' 
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch most liked posts');
    }
  }

  // Get most commented posts
  async getMostCommentedPosts(limit: number = 10): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ 
        limit, 
        sortBy: 'comments_count', 
        sortOrder: 'desc' 
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch most commented posts');
    }
  }

  // Get most viewed posts
  async getMostViewedPosts(limit: number = 10): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ 
        limit, 
        sortBy: 'views_count', 
        sortOrder: 'desc' 
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch most viewed posts');
    }
  }

  // Get posts by engagement (likes + comments + views)
  async getPostsByEngagement(limit: number = 10): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ 
        limit, 
        sortBy: 'engagement', 
        sortOrder: 'desc' 
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch posts by engagement');
    }
  }

  // Get posts by date range
  async getPostsByDateRange(dateFrom: string, dateTo: string, params?: Omit<PostListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ posts: Post[]; stats: PostStats }>> {
    try {
      return await this.getAllPosts({ ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch posts by date range');
    }
  }

  // Get user post analytics
  async getUserPostAnalytics(userId: number, days: number = 30): Promise<ApiResponse<{ analytics: { totalPosts: number; totalLikes: number; totalComments: number; totalViews: number; averageLikesPerPost: number; averageCommentsPerPost: number; averageViewsPerPost: number; engagementRate: number; postsByDay: Array<{ date: string; count: number }> } }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await this.getPostsByUser(
        userId,
        {
          dateFrom: startDate.toISOString().split('T')[0],
          dateTo: endDate.toISOString().split('T')[0]
        }
      );
      
      const posts = response.data.posts;
      const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
      const totalComments = posts.reduce((sum, post) => sum + post.comments_count, 0);
      const totalViews = posts.reduce((sum, post) => sum + post.views_count, 0);
      
      // Group posts by date
      const postsByDay = posts.reduce((acc, post) => {
        const date = post.created_date_time.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const postsByDayArray = Object.entries(postsByDay).map(([date, count]) => ({ date, count }));
      
      return {
        success: true,
        message: 'User post analytics fetched successfully',
        data: {
          analytics: {
            totalPosts: posts.length,
            totalLikes,
            totalComments,
            totalViews,
            averageLikesPerPost: posts.length > 0 ? totalLikes / posts.length : 0,
            averageCommentsPerPost: posts.length > 0 ? totalComments / posts.length : 0,
            averageViewsPerPost: posts.length > 0 ? totalViews / posts.length : 0,
            engagementRate: posts.length > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0,
            postsByDay: postsByDayArray
          }
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user post analytics');
    }
  }

  // Error handling
  private handleError(error: any, message: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(message, 0, error);
  }
}

// Export singleton instance
export const postsAPI = new PostsAPI();

// Export types
export type {
  Post as PostType,
  PostComment as PostCommentType,
  PostLike as PostLikeType,
  PostImage as PostImageType,
  PostReport as PostReportType,
  PostStats as PostStatsType,
  PostListParams as PostListParamsType,
};
