import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, SearchParams, ApiResponse } from './config';

// User interfaces
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
  joinDate?: string;
  lastRecharge?: string;
  username?: string;
  bio?: string;
  age?: number;
  gender?: string;
  profession?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  consultation_fee?: number;
  per_minute_cost?: number;
  chat_per_minute_cost?: number;
  commission_per?: number;
  chat_commission_per?: number;
  doctor_profile_status?: number;
  created_date_time?: string;
  updated_date_time?: string;
}

export interface State {
  state_id: number;
  state_name: string;
  country_id: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  kycVerified: number;
  kycPending: number;
  kycRejected: number;
}

export interface UserListParams extends PaginationParams, SearchParams {
  status?: number;
  isDoctor?: number;
  kycStatus?: number;
  stateId?: number;
  dateFrom?: string;
  dateTo?: string;
}

// User Data API class
export class UserDataAPI {
  // Get all users with pagination and filters
  async getAllUsers(params?: UserListParams): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.USER_DATA.GET_ALL_USERS, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch users');
    }
  }

  // Get all listeners/doctors with pagination and filters
  async getAllListeners(params?: UserListParams): Promise<ApiResponse<{ listeners: User[]; stats: UserStats }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.USER_DATA.GET_ALL_LISTENERS, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch listeners');
    }
  }

  // Get user statistics
  async getStats(): Promise<ApiResponse<UserStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.USER_DATA.GET_STATS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user statistics');
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<ApiResponse<User>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_DATA.GET_BY_ID, { id: userId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user ${userId}`);
    }
  }

  // Search users by name, email, or mobile
  async searchUsers(query: string, params?: Omit<UserListParams, 'search'>): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await this.getAllUsers({ ...params, search: query });
    } catch (error) {
      throw this.handleError(error, 'Failed to search users');
    }
  }

  // Get users by status
  async getUsersByStatus(status: number, params?: Omit<UserListParams, 'status'>): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await this.getAllUsers({ ...params, status });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch users with status ${status}`);
    }
  }

  // Get doctors by status
  async getDoctorsByStatus(status: number, params?: Omit<UserListParams, 'status'>): Promise<ApiResponse<{ listeners: User[]; stats: UserStats }>> {
    try {
      return await this.getAllListeners({ ...params, status, isDoctor: 1 });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch doctors with status ${status}`);
    }
  }

  // Get users by KYC status
  async getUsersByKycStatus(kycStatus: number, params?: Omit<UserListParams, 'kycStatus'>): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await this.getAllUsers({ ...params, kycStatus });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch users with KYC status ${kycStatus}`);
    }
  }

  // Get users by state
  async getUsersByState(stateId: number, params?: Omit<UserListParams, 'stateId'>): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await this.getAllUsers({ ...params, stateId });
    } catch (error) {
      throw this.handleError(error, `Failed to fetch users from state ${stateId}`);
    }
  }

  // Get users by date range
  async getUsersByDateRange(dateFrom: string, dateTo: string, params?: Omit<UserListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await this.getAllUsers({ ...params, dateFrom, dateTo });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch users by date range');
    }
  }

  // Get recent users (last 7 days)
  async getRecentUsers(params?: Omit<UserListParams, 'dateFrom' | 'dateTo'>): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];
      const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
      
      return await this.getUsersByDateRange(dateFrom, today, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent users');
    }
  }

  // Get top users by activity (if supported by backend)
  async getTopUsers(limit: number = 10): Promise<ApiResponse<{ users: User[]; stats: UserStats }>> {
    try {
      return await this.getAllUsers({ limit, sortBy: 'activity', sortOrder: 'desc' });
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch top users');
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
export const userDataAPI = new UserDataAPI();

