import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, SearchParams, ApiResponse } from './config';

// Notification interfaces
export interface Notification {
  notification_id: string;
  user_id: number | null;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: number;
  is_sent: number;
  sent_at: string | null;
  created_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    profile_photo: string | null;
  } | null;
}

export interface FCMToken {
  token_id: string;
  user_id: number;
  token: string;
  platform: string;
  is_active: number;
  created_date_time: string;
  updated_date_time: string;
  user: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
  };
}

export interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  pendingNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  notificationsToday: number;
  notificationsThisWeek: number;
  notificationsThisMonth: number;
  totalFCMTokens: number;
  activeFCMTokens: number;
  inactiveFCMTokens: number;
  topNotificationTypes: Array<{ type: string; count: number; percentage: number }>;
  deliveryRate: number;
  readRate: number;
}

export interface FCMStats {
  totalTokens: number;
  activeTokens: number;
  inactiveTokens: number;
  platformBreakdown: Array<{ platform: string; count: number; percentage: number }>;
  tokensToday: number;
  tokensThisWeek: number;
  tokensThisMonth: number;
  averageTokensPerUser: number;
}

export interface SendNotificationRequest {
  user_ids?: number[];
  title: string;
  message: string;
  type: string;
  data?: any;
  send_to_all?: boolean;
}

export interface ScheduleNotificationRequest {
  user_ids?: number[];
  title: string;
  message: string;
  type: string;
  data?: any;
  scheduled_at: string;
  send_to_all?: boolean;
}

export interface SendGlobalNotificationRequest {
  title: string;
  message: string;
  type: string;
  data?: any;
}

export interface NotificationListParams extends PaginationParams, SearchParams {
  userId?: number;
  type?: string;
  isRead?: number;
  isSent?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Notifications API class
export class NotificationsAPI {
  // Get all notifications
  async getAllNotifications(params?: NotificationListParams): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch notifications');
    }
  }

  // Get notifications by user
  async getNotificationsByUser(userId: number, params?: Omit<NotificationListParams, 'userId'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER, { userId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch notifications for user ${userId}`);
    }
  }

  // Get notification statistics
  async getNotificationStatistics(): Promise<ApiResponse<NotificationStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.GET_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch notification statistics');
    }
  }

  // Get FCM token statistics
  async getFCMStatistics(): Promise<ApiResponse<FCMStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.GET_FCM_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch FCM statistics');
    }
  }

  // Send notification
  async sendNotification(request: SendNotificationRequest): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, request);
    } catch (error) {
      throw this.handleError(error, 'Failed to send notification');
    }
  }

  // Schedule notification
  async scheduleNotification(request: ScheduleNotificationRequest): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SCHEDULE, request);
    } catch (error) {
      throw this.handleError(error, 'Failed to schedule notification');
    }
  }

  // Send global notification
  async sendGlobalNotification(request: SendGlobalNotificationRequest): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND_GLOBAL, request);
    } catch (error) {
      throw this.handleError(error, 'Failed to send global notification');
    }
  }

  // Search notifications
  async searchNotifications(query: string, params?: Omit<NotificationListParams, 'search'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      return await this.getAllNotifications({ ...params, search: query });
    } catch (error) {
      throw this.handleError(error, 'Failed to search notifications');
    }
  }

  // Get notifications by type
  async getNotificationsByType(type: string, params?: Omit<NotificationListParams, 'type'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      return await this.getAllNotifications({ ...params, type });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch notifications with type ${type}`);
    }
  }

  // Get unread notifications
  async getUnreadNotifications(params?: Omit<NotificationListParams, 'isRead'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      return await this.getAllNotifications({ ...params, isRead: 0 });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch unread notifications');
    }
  }

  // Get sent notifications
  async getSentNotifications(params?: Omit<NotificationListParams, 'isSent'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      return await this.getAllNotifications({ ...params, isSent: 1 });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch sent notifications');
    }
  }

  // Get pending notifications
  async getPendingNotifications(params?: Omit<NotificationListParams, 'isSent'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      return await this.getAllNotifications({ ...params, isSent: 0 });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch pending notifications');
    }
  }

  // Get recent notifications (last 7 days)
  async getRecentNotifications(params?: Omit<NotificationListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      
      return await this.getAllNotifications({ ...params, dateFrom, dateTo: today });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent notifications');
    }
  }

  // Get today's notifications
  async getTodaysNotifications(params?: Omit<NotificationListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ notifications: Notification[]; stats: NotificationStats }>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getAllNotifications({ ...params, dateFrom: today, dateTo: today });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch today\'s notifications');
    }
  }

  // Get top notification types
  async getTopNotificationTypes(limit: number = 10): Promise<ApiResponse<{ types: Array<{ type: string; count: number; percentage: number }> }>> {
    try {
      const response = await this.getNotificationStatistics();
      return {
        success: true,
        message: 'Top notification types fetched successfully',
        data: {
          types: response.data.topNotificationTypes.slice(0, limit)
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top notification types');
    }
  }

  // Get FCM platform breakdown
  async getFCMPlatformBreakdown(): Promise<ApiResponse<{ platforms: Array<{ platform: string; count: number; percentage: number }> }>> {
    try {
      const response = await this.getFCMStatistics();
      return {
        success: true,
        message: 'FCM platform breakdown fetched successfully',
        data: {
          platforms: response.data.platformBreakdown
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch FCM platform breakdown');
    }
  }

  // Send notification to specific users
  async sendNotificationToUsers(userIds: number[], title: string, message: string, type: string, data?: any): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await this.sendNotification({
        user_ids: userIds,
        title,
        message,
        type,
        data
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to send notification to users');
    }
  }

  // Send notification to all users
  async sendNotificationToAll(title: string, message: string, type: string, data?: any): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await this.sendNotification({
        send_to_all: true,
        title,
        message,
        type,
        data
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to send notification to all users');
    }
  }

  // Schedule notification for specific users
  async scheduleNotificationForUsers(userIds: number[], title: string, message: string, type: string, scheduledAt: string, data?: any): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await this.scheduleNotification({
        user_ids: userIds,
        title,
        message,
        type,
        scheduled_at: scheduledAt,
        data
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to schedule notification for users');
    }
  }

  // Schedule notification for all users
  async scheduleNotificationForAll(title: string, message: string, type: string, scheduledAt: string, data?: any): Promise<ApiResponse<{ success: boolean; message: string; notification_ids: string[] }>> {
    try {
      return await this.scheduleNotification({
        send_to_all: true,
        title,
        message,
        type,
        scheduled_at: scheduledAt,
        data
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to schedule notification for all users');
    }
  }

  // Get notification delivery metrics
  async getDeliveryMetrics(): Promise<ApiResponse<{ deliveryRate: number; readRate: number; totalSent: number; totalRead: number; totalDelivered: number }>> {
    try {
      const response = await this.getNotificationStatistics();
      return {
        success: true,
        message: 'Delivery metrics fetched successfully',
        data: {
          deliveryRate: response.data.deliveryRate,
          readRate: response.data.readRate,
          totalSent: response.data.sentNotifications,
          totalRead: response.data.readNotifications,
          totalDelivered: response.data.sentNotifications // Assuming sent means delivered
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch delivery metrics');
    }
  }

  // Get user notification preferences (if supported by backend)
  async getUserNotificationPreferences(_userId: number): Promise<ApiResponse<{ preferences: { email: boolean; push: boolean; sms: boolean; types: string[] } }>> {
    try {
      // This would need to be implemented based on backend support
      // For now, return a default structure
      return {
        success: true,
        message: 'User notification preferences fetched successfully',
        data: {
          preferences: {
            email: true,
            push: true,
            sms: false,
            types: ['general', 'session', 'payment', 'system']
          }
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user notification preferences');
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
export const notificationsAPI = new NotificationsAPI();

