import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, DateRangeParams, SearchParams, ApiResponse } from './config';

// Activity interfaces
export interface Activity {
  activity_id: string;
  user_id: number;
  activity_type: string;
  description: string;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    profile_photo: string | null;
  };
}

export interface ActivityStats {
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  uniqueUsers: number;
  topActivityTypes: Array<{ type: string; count: number; percentage: number }>;
  topUsers: Array<{ user_id: number; full_name: string; activity_count: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  dailyDistribution: Array<{ date: string; count: number }>;
}

export interface UserActivityStats {
  userId: number;
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  lastActivity: string | null;
  topActivityTypes: Array<{ type: string; count: number; percentage: number }>;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    profile_photo: string | null;
  };
}

export interface CreateActivityRequest {
  user_id: number;
  activity_type: string;
  description: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

export interface UpdateActivityRequest {
  activity_type?: string;
  description?: string;
  metadata?: any;
}

export interface ActivityListParams extends PaginationParams, DateRangeParams, SearchParams {
  userId?: number;
  phoneNumber?: string;
  type?: string;
}

// Activity API class
export class ActivityAPI {
  // Get latest activities
  async getLatestActivities(params?: Omit<ActivityListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ activities: Activity[]; stats: ActivityStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ACTIVITY.GET_LATEST, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch latest activities');
    }
  }

  // Get activities by user
  async getActivitiesByUser(userId: number, params?: Omit<ActivityListParams, 'userId'>): Promise<ApiResponse<{ activities: Activity[]; stats: UserActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_BY_USER, { userId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activities for user ${userId}`);
    }
  }

  // Get activities by user phone
  async getActivitiesByUserPhone(phoneNumber: string, params?: Omit<ActivityListParams, 'phoneNumber'>): Promise<ApiResponse<{ activities: Activity[]; stats: UserActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_BY_USER_PHONE, { phoneNumber });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activities for user with phone ${phoneNumber}`);
    }
  }

  // Get activities by type
  async getActivitiesByType(type: string, params?: Omit<ActivityListParams, 'type'>): Promise<ApiResponse<{ activities: Activity[]; stats: ActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_BY_TYPE, { type });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activities with type ${type}`);
    }
  }

  // Get activities by user and type
  async getActivitiesByUserAndType(userId: number, type: string, params?: Omit<ActivityListParams, 'userId' | 'type'>): Promise<ApiResponse<{ activities: Activity[]; stats: UserActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_BY_USER_AND_TYPE, { userId, type });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activities with type ${type} for user ${userId}`);
    }
  }

  // Get activities by user phone and type
  async getActivitiesByUserPhoneAndType(phoneNumber: string, type: string, params?: Omit<ActivityListParams, 'phoneNumber' | 'type'>): Promise<ApiResponse<{ activities: Activity[]; stats: UserActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_BY_USER_PHONE_AND_TYPE, { phoneNumber, type });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activities with type ${type} for user with phone ${phoneNumber}`);
    }
  }

  // Get activity statistics
  async getActivityStatistics(): Promise<ApiResponse<ActivityStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ACTIVITY.GET_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch activity statistics');
    }
  }

  // Get user activity statistics
  async getUserActivityStatistics(userId: number): Promise<ApiResponse<UserActivityStats>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_USER_STATISTICS, { userId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activity statistics for user ${userId}`);
    }
  }

  // Get user phone activity statistics
  async getUserPhoneActivityStatistics(phoneNumber: string): Promise<ApiResponse<UserActivityStats>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_USER_PHONE_STATISTICS, { phoneNumber });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activity statistics for user with phone ${phoneNumber}`);
    }
  }

  // Get activities by date range
  async getActivitiesByDateRange(dateFrom: string, dateTo: string, params?: Omit<ActivityListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ activities: Activity[]; stats: ActivityStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ACTIVITY.GET_BY_DATE_RANGE, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch activities by date range');
    }
  }

  // Get user activities by date range
  async getUserActivitiesByDateRange(userId: number, dateFrom: string, dateTo: string, params?: Omit<ActivityListParams, 'userId' | 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ activities: Activity[]; stats: UserActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_USER_BY_DATE_RANGE, { userId });
      return await apiClient.get(endpoint, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user activities by date range for user ${userId}`);
    }
  }

  // Get user phone activities by date range
  async getUserPhoneActivitiesByDateRange(phoneNumber: string, dateFrom: string, dateTo: string, params?: Omit<ActivityListParams, 'phoneNumber' | 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ activities: Activity[]; stats: UserActivityStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_USER_PHONE_BY_DATE_RANGE, { phoneNumber });
      return await apiClient.get(endpoint, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user phone activities by date range for phone ${phoneNumber}`);
    }
  }

  // Get activity by ID
  async getActivityById(activityId: string): Promise<ApiResponse<Activity>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.GET_BY_ID, { activityId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch activity ${activityId}`);
    }
  }

  // Create activity
  async createActivity(request: CreateActivityRequest): Promise<ApiResponse<Activity>> {
    try {
      return await apiClient.post(API_ENDPOINTS.ACTIVITY.CREATE, request);
    } catch (error) {
      throw this.handleError(error, 'Failed to create activity');
    }
  }

  // Update activity
  async updateActivity(activityId: string, request: UpdateActivityRequest): Promise<ApiResponse<Activity>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.UPDATE, { activityId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update activity ${activityId}`);
    }
  }

  // Delete activity
  async deleteActivity(activityId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.ACTIVITY.DELETE, { activityId });
      return await apiClient.post(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to delete activity ${activityId}`);
    }
  }

  // Search activities
  async searchActivities(query: string, params?: Omit<ActivityListParams, 'search'>): Promise<ApiResponse<{ activities: Activity[]; stats: ActivityStats }>> {
    try {
      return await this.getLatestActivities({ ...params, search: query });
    } catch (error) {
      throw this.handleError(error, 'Failed to search activities');
    }
  }

  // Get recent activities (last 7 days)
  async getRecentActivities(params?: Omit<ActivityListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ activities: Activity[]; stats: ActivityStats }>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      
      return await this.getActivitiesByDateRange(dateFrom, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent activities');
    }
  }

  // Get today's activities
  async getTodaysActivities(params?: Omit<ActivityListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ activities: Activity[]; stats: ActivityStats }>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getActivitiesByDateRange(today, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch today\'s activities');
    }
  }

  // Get top activity types
  async getTopActivityTypes(limit: number = 10): Promise<ApiResponse<{ types: Array<{ type: string; count: number; percentage: number }> }>> {
    try {
      const response = await this.getActivityStatistics();
      return {
        success: true,
        message: 'Top activity types fetched successfully',
        data: {
          types: response.data.topActivityTypes.slice(0, limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top activity types');
    }
  }

  // Get most active users
  async getMostActiveUsers(limit: number = 10): Promise<ApiResponse<{ users: Array<{ user_id: number; full_name: string; activity_count: number }> }>> {
    try {
      const response = await this.getActivityStatistics();
      return {
        success: true,
        message: 'Most active users fetched successfully',
        data: {
          users: response.data.topUsers.slice(0, limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch most active users');
    }
  }

  // Get activity timeline for user
  async getUserActivityTimeline(userId: number, days: number = 30): Promise<ApiResponse<{ timeline: Array<{ date: string; activities: Activity[]; count: number }> }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await this.getUserActivitiesByDateRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Group activities by date
      const activitiesByDate = response.data.activities.reduce((acc, activity) => {
        const date = activity.created_date_time.split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {} as Record<string, Activity[]>);
      
      const timeline = Object.entries(activitiesByDate).map(([date, activities]) => ({
        date,
        activities,
        count: activities.length
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return {
        success: true,
        message: 'User activity timeline fetched successfully',
        data: { timeline }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user activity timeline');
    }
  }

  // Track user activity (convenience method)
  async trackUserActivity(userId: number, activityType: string, description: string, metadata?: any): Promise<ApiResponse<Activity>> {
    try {
      return await this.createActivity({
        user_id: userId,
        activity_type: activityType,
        description,
        metadata,
        ip_address: undefined, // Will be set by backend
        user_agent: undefined  // Will be set by backend
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to track user activity');
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
export const activityAPI = new ActivityAPI();

// Export types
export type {
  Activity as ActivityType,
  ActivityStats as ActivityStatsType,
  UserActivityStats as UserActivityStatsType,
  CreateActivityRequest as CreateActivityRequestType,
  UpdateActivityRequest as UpdateActivityRequestType,
  ActivityListParams as ActivityListParamsType,
};
