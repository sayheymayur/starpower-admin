import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, PaginationParams, DateRangeParams, SearchParams, ApiResponse } from './config';

// Doctor Availability interfaces
export interface DoctorAvailabilityStatus {
  avail_status_id_pk: number;
  user_id_fk: number;
  avail_status: number;
  last_update_date_time: string;
  created_date_time: string;
  created_by: number;
  doctorName?: string;
  mobile_no?: string;
  email_id?: string;
  statusText?: string;
}

export interface DoctorAvailability {
  availability_id: string;
  doctor_id: number;
  status: number;
  start_time: string;
  end_time: string | null;
  reason: string | null;
  created_date_time: string;
  updated_date_time: string;
  doctor: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    profile_photo: string | null;
    specialization: string | null;
    experience: number | null;
    per_minute_cost: number | null;
  };
}

export interface AvailabilityStats {
  totalAvailable: number;
  totalUnavailable: number;
  totalDoctors: number;
  availabilityRate: string;
  statistics: {
    available: {
      count: number;
      percentage: string;
    };
    unavailable: {
      count: number;
      percentage: string;
    };
  };
}

export interface DoctorStatusUpdateRequest {
  avail_status: number;
  created_by: number;
}

export interface BulkStatusUpdateRequest {
  userIds?: number[];
  phoneNumbers?: string[];
  avail_status: number;
  created_by: number;
}

export interface DoctorStatusResponse {
  userId: number;
  doctorName: string;
  mobile_no?: string;
  email_id?: string;
  currentStatus?: DoctorAvailabilityStatus;
  isAvailable?: boolean;
  statusText?: string;
  updatedStatus?: DoctorAvailabilityStatus;
  timestamp?: string;
}

export interface DoctorHistoryResponse {
  userId: number;
  doctorName: string;
  history: DoctorAvailabilityStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DoctorsByStatusResponse {
  status: number;
  statusText: string;
  doctors: DoctorAvailabilityStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkUpdateResponse {
  successful: Array<{
    userId: number;
    success: boolean;
    data: DoctorAvailabilityStatus;
  }>;
  failed: Array<{
    userId: number;
    error: string;
  }>;
  totalProcessed: number;
}

export interface DoctorAvailabilityStats {
  doctorId: number;
  totalRecords: number;
  activeRecords: number;
  inactiveRecords: number;
  currentStatus: number;
  totalHours: number;
  averageSessionDuration: number;
  recordsToday: number;
  recordsThisWeek: number;
  recordsThisMonth: number;
  lastActivity: string | null;
  doctor: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    specialization: string | null;
    experience: number | null;
    per_minute_cost: number | null;
  };
}

export interface AvailabilityHistory {
  availability_id: string;
  doctor_id: number;
  status: number;
  start_time: string;
  end_time: string | null;
  duration: number;
  reason: string | null;
  created_date_time: string;
  doctor: {
    user_id_pk: number;
    full_name: string | null;
    mobile_no: string;
    email_id: string | null;
    specialization: string | null;
  };
}

export interface CreateAvailabilityRequest {
  doctor_id: number;
  status: number;
  start_time: string;
  end_time?: string;
  reason?: string;
}

export interface UpdateAvailabilityRequest {
  status?: number;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface AvailabilityListParams extends PaginationParams, DateRangeParams, SearchParams {
  doctorId?: number;
  status?: number;
}

// Doctor Availability API class
export class DoctorAvailabilityAPI {
  // Update doctor availability status by user ID
  async updateStatusByUserId(userId: number, request: DoctorStatusUpdateRequest): Promise<ApiResponse<DoctorStatusResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.UPDATE_STATUS_BY_USER_ID, { userId });
      return await apiClient.put(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update status for doctor ${userId}`);
    }
  }

  // Update doctor availability status by phone number
  async updateStatusByPhone(phoneNumber: string, request: DoctorStatusUpdateRequest): Promise<ApiResponse<DoctorStatusResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.UPDATE_STATUS_BY_PHONE, { phoneNumber });
      return await apiClient.put(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update status for doctor with phone ${phoneNumber}`);
    }
  }

  // Get doctor's current availability status by user ID
  async getStatusByUserId(userId: number): Promise<ApiResponse<DoctorStatusResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_STATUS_BY_USER_ID, { userId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch status for doctor ${userId}`);
    }
  }

  // Get doctor's current availability status by phone number
  async getStatusByPhone(phoneNumber: string): Promise<ApiResponse<DoctorStatusResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_STATUS_BY_PHONE, { phoneNumber });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch status for doctor with phone ${phoneNumber}`);
    }
  }

  // Get doctor's availability history by user ID
  async getHistoryByUserId(userId: number, params?: PaginationParams): Promise<ApiResponse<DoctorHistoryResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_HISTORY_BY_USER_ID, { userId });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch history for doctor ${userId}`);
    }
  }

  // Get doctor's availability history by phone number
  async getHistoryByPhone(phoneNumber: string, params?: PaginationParams): Promise<ApiResponse<DoctorHistoryResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_HISTORY_BY_PHONE, { phoneNumber });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch history for doctor with phone ${phoneNumber}`);
    }
  }

  // Get all doctors with specific availability status
  async getDoctorsByStatus(status: number, params?: PaginationParams): Promise<ApiResponse<DoctorsByStatusResponse>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_DOCTORS_BY_STATUS, { status });
      return await apiClient.get(endpoint, params);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch doctors with status ${status}`);
    }
  }

  // Get all available doctors
  async getAvailableDoctors(params?: PaginationParams): Promise<ApiResponse<DoctorsByStatusResponse>> {
    try {
      return await apiClient.get(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_AVAILABLE_DOCTORS, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch available doctors');
    }
  }

  // Get all unavailable doctors
  async getUnavailableDoctors(params?: PaginationParams): Promise<ApiResponse<DoctorsByStatusResponse>> {
    try {
      return await apiClient.get(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_UNAVAILABLE_DOCTORS, params);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch unavailable doctors');
    }
  }

  // Get availability statistics
  async getStatistics(): Promise<ApiResponse<AvailabilityStats>> {
    try {
      return await apiClient.get(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_STATISTICS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch availability statistics');
    }
  }

  // Bulk update doctor availability status
  async bulkUpdateStatus(request: BulkStatusUpdateRequest): Promise<ApiResponse<BulkUpdateResponse>> {
    try {
      return await apiClient.put(API_ENDPOINTS.DOCTOR_AVAILABILITY.BULK_UPDATE_STATUS, request);
    } catch (error) {
      throw this.handleError(error, 'Failed to bulk update doctor status');
    }
  }

  // Get specific availability status record by ID
  async getStatusById(statusId: number): Promise<ApiResponse<DoctorAvailabilityStatus>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET_STATUS_BY_ID, { statusId });
      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch status record ${statusId}`);
    }
  }

  // Delete availability status record by ID
  async deleteStatusById(statusId: number): Promise<ApiResponse<{ statusId: number; deleted: boolean }>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.DOCTOR_AVAILABILITY.DELETE_STATUS_BY_ID, { statusId });
      return await apiClient.delete(endpoint);
    } catch (error) {
      throw this.handleError(error, `Failed to delete status record ${statusId}`);
    }
  }

  // Helper method to get status text
  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Unavailable';
      case 1: return 'Available';
      case 2: return 'Busy';
      case 3: return 'On Break';
      default: return 'Unknown';
    }
  }

  // Helper method to get status color
  getStatusColor(status: number): string {
    switch (status) {
      case 0: return 'bg-red-100 text-red-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
export const doctorAvailabilityAPI = new DoctorAvailabilityAPI();

