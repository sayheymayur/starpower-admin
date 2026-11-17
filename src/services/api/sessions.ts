import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, DateRangeParams, SearchParams, ApiResponse } from './config';

// Session interfaces
export type MissedSessionType = 'all' | 'cancelled' | 'rejected' | 'timeout';
export type SessionDateField =
  | 'request_date_time'
  | 'created_date_time'
  | 'cancelled_date_time'
  | 'start_date_time'
  | 'end_date_time';

export interface Session {
  session_id: string;
  user_id: number;
  listener_id: number;
  status: string;
  session_type: number;
  start_time: string;
  end_time: string | null;
  duration: number;
  cost: number;
  remark: string | null;
  cancellation_type: number | null;
  is_cancelled_by_server: number;
  created_date_time: string;
  updated_date_time: string;
  /** Present on missed-session responses: cancelled | rejected | timeout */
  missedType?: 'cancelled' | 'rejected' | 'timeout' | null;
  user: User;
  listener: Listener;
}

export interface User {
  user_id_pk: number;
  full_name: string | null;
  mobile_no: string;
  email_id: string | null;
  profile_photo: string | null;
  state: State | null;
  status: number;
  is_doctor: number;
  kyc_status: number;
}

export interface Listener {
  user_id_pk: number;
  full_name: string | null;
  mobile_no: string;
  email_id: string | null;
  profile_photo: string | null;
  state: State | null;
  status: number;
  is_doctor: number;
  kyc_status: number;
  per_minute_cost?: number;
  commission_per?: number;
  doctor_profile_status?: number;
}

export interface State {
  state_id: number;
  state_name: string;
  country_id: number;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  rejectedSessions: number;
  timeoutSessions: number;
  totalRevenue: number;
  averageSessionDuration: number;
  averageSessionCost: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  topUsers: Array<{ user_id: number; full_name: string; session_count: number }>;
  topListeners: Array<{ listener_id: number; full_name: string; session_count: number }>;
}

export interface SessionDetails {
  session: Session;
  chat_messages: ChatMessage[];
  call_details: CallDetails | null;
  ratings: Rating[];
  transactions: Transaction[];
}

export interface ChatMessage {
  message_id: string;
  session_id: string;
  sender_id: number;
  message: string;
  message_type: string;
  created_date_time: string;
}

export interface CallDetails {
  call_id: string;
  session_id: string;
  channel_name: string;
  token: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  quality: string;
}

export interface Rating {
  rating_id: string;
  session_id: string;
  user_id: number;
  listener_id: number;
  rating: number;
  review: string | null;
  created_date_time: string;
}

export interface Transaction {
  transaction_id: string;
  session_id: string;
  user_id: number;
  amount: number;
  transaction_type: string;
  status: string;
  created_date_time: string;
}

export interface SessionListParams extends PaginationParams, DateRangeParams, SearchParams {
  status?: string;
  /** Filter never-started sessions (cancelled / rejected / timed out). Prefer status=missed. */
  missed?: boolean | string;
  missedType?: MissedSessionType;
  startDate?: string;
  endDate?: string;
  dateField?: SessionDateField;
  sessionType?: number;
  userId?: number;
  listenerId?: number;
  userName?: string;
  listenerName?: string;
  phoneNumber?: string;
  cancellationType?: number;
  isCancelledByServer?: number;
}

// Session API class
export class SessionsAPI {
  // Get all sessions with pagination and filters
  async getAllSessions(params?: SessionListParams): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_ALL, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch sessions');
    }
  }

  // Get sessions by user
  async getSessionsByUser(userId: number, params?: Omit<SessionListParams, 'userId'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.SESSIONS.GET_BY_USER, { userId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch sessions for user ${userId}`);
    }
  }

  // Get sessions by listener
  async getSessionsByListener(listenerId: number, params?: Omit<SessionListParams, 'listenerId'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.SESSIONS.GET_BY_LISTENER, { listenerId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch sessions for listener ${listenerId}`);
    }
  }

  // Get sessions by date range
  async getSessionsByDateRange(dateFrom: string, dateTo: string, params?: Omit<SessionListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_BY_DATE, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch sessions by date range');
    }
  }

  // Get user sessions by date range
  async getUserSessionsByDateRange(userId: number, dateFrom: string, dateTo: string, params?: Omit<SessionListParams, 'userId' | 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.SESSIONS.GET_USER_BY_DATE, { userId });
      return await apiClient.get(endpoint, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user sessions by date range for user ${userId}`);
    }
  }

  // Get listener sessions by date range
  async getListenerSessionsByDateRange(listenerId: number, dateFrom: string, dateTo: string, params?: Omit<SessionListParams, 'listenerId' | 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.SESSIONS.GET_LISTENER_BY_DATE, { listenerId });
      return await apiClient.get(endpoint, { ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch listener sessions by date range for listener ${listenerId}`);
    }
  }

  // Get active sessions
  async getActiveSessions(params?: Omit<SessionListParams, 'status'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_ACTIVE, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch active sessions');
    }
  }

  // Get completed sessions
  async getCompletedSessions(params?: Omit<SessionListParams, 'status'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_COMPLETED, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch completed sessions');
    }
  }

  // Get cancelled sessions
  async getCancelledSessions(params?: Omit<SessionListParams, 'status'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_CANCELLED, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch cancelled sessions');
    }
  }

  // Get missed sessions (never started: cancelled / rejected / timed out)
  async getMissedSessions(params?: SessionListParams): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_MISSED, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch missed sessions');
    }
  }

  // Get session statistics
  async getSessionStats(): Promise<ApiResponse<SessionStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.SESSIONS.GET_STATS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch session statistics');
    }
  }

  // Get detailed session information
  async getSessionDetails(sessionId: string): Promise<ApiResponse<SessionDetails>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.SESSIONS.GET_DETAILS, { sessionId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch session details for ${sessionId}`);
    }
  }

  // Get session by ID
  async getSessionById(sessionId: string): Promise<ApiResponse<Session>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.SESSIONS.GET_BY_ID, { sessionId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch session ${sessionId}`);
    }
  }

  // Search sessions
  async searchSessions(query: string, params?: Omit<SessionListParams, 'search'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await this.getAllSessions({ ...params, search: query });
    } catch (error) {
      throw this.handleError(error, 'Failed to search sessions');
    }
  }

  // Get sessions by status
  async getSessionsByStatus(status: string, params?: Omit<SessionListParams, 'status'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await this.getAllSessions({ ...params, status });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch sessions with status ${status}`);
    }
  }

  // Get sessions by type
  async getSessionsByType(sessionType: number, params?: Omit<SessionListParams, 'sessionType'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      return await this.getAllSessions({ ...params, sessionType });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch sessions with type ${sessionType}`);
    }
  }

  // Get recent sessions (last 7 days)
  async getRecentSessions(params?: Omit<SessionListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      
      return await this.getSessionsByDateRange(dateFrom, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent sessions');
    }
  }

  // Get today's sessions
  async getTodaysSessions(params?: Omit<SessionListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ sessions: Session[]; stats: SessionStats }>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getSessionsByDateRange(today, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch today\'s sessions');
    }
  }

  // Get top performing users
  async getTopUsers(limit: number = 10): Promise<ApiResponse<{ users: Array<{ user_id: number; full_name: string; session_count: number; total_revenue: number }> }>> {
    try {
      const response = await this.getSessionStats();
      return {
        success: true,
        message: 'Top users fetched successfully',
        data: {
          users: response.data.topUsers.slice(0, limit) as Array<{
            user_id: number;
            full_name: string;
            session_count: number;
            total_revenue: number;
          }>,
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top users');
    }
  }

  // Get top performing listeners
  async getTopListeners(limit: number = 10): Promise<ApiResponse<{ listeners: Array<{ listener_id: number; full_name: string; session_count: number; total_revenue: number }> }>> {
    try {
      const response = await this.getSessionStats();
      return {
        success: true,
        message: 'Top listeners fetched successfully',
        data: {
          listeners: response.data.topListeners.slice(0, limit) as Array<{
            listener_id: number;
            full_name: string;
            session_count: number;
            total_revenue: number;
          }>,
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top listeners');
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
export const sessionsAPI = new SessionsAPI();

