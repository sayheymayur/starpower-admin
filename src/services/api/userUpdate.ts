import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, ApiResponse } from './config';

// Update request interfaces
export interface UpdateUserRequest {
  full_name?: string;
  mobile_no?: string;
  email_id?: string;
  profile_photo?: string;
  state_id?: number;
  status?: number;
  is_doctor?: number;
  kyc_status?: number;
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
  /** General test-account flag (DB column) */
  test_user?: number | boolean;
}

export interface BulkUpdateRequest {
  userIds: number[];
  updates: UpdateUserRequest;
}

export interface FieldUpdateRequest {
  value: any;
}

export interface StatusUpdateRequest {
  status: number;
  reason?: string;
}

export interface CategoryUpdateRequest {
  category: string;
}

export interface StateUpdateRequest {
  state_id: number;
}

export interface ProfilePhotoUpdateRequest {
  profile_photo: string;
}

export interface EmailUpdateRequest {
  email_id: string;
}

export interface MobileUpdateRequest {
  mobile_no: string;
}

export interface FullNameUpdateRequest {
  full_name: string;
}

export interface UsernameUpdateRequest {
  username: string;
}

export interface BioUpdateRequest {
  bio: string;
}

export interface AgeUpdateRequest {
  age: number;
}

export interface GenderUpdateRequest {
  gender: string;
}

export interface ProfessionUpdateRequest {
  profession: string;
}

export interface QualificationUpdateRequest {
  qualification: string;
}

export interface ExperienceUpdateRequest {
  experience: number;
}

export interface SpecializationUpdateRequest {
  specialization: string;
}

export interface ConsultationFeeUpdateRequest {
  consultation_fee: number;
}

export interface PerMinuteCostUpdateRequest {
  per_minute_cost: number;
}

export interface ChatPerMinuteCostUpdateRequest {
  chat_per_minute_cost: number;
}

export interface CommissionPerUpdateRequest {
  commission_per: number;
}

export interface ChatCommissionPerUpdateRequest {
  chat_commission_per: number;
}

export interface KycStatusUpdateRequest {
  kyc_status: number;
  reason?: string;
}

export interface DoctorProfileStatusUpdateRequest {
  doctor_profile_status: number;
  reason?: string;
}

export interface AuditLogUpdateRequest {
  audit_log: string;
}

// User Update API class
export class UserUpdateAPI {
  // Update user by ID
  async updateUserById(userId: number, updates: UpdateUserRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_BY_ID, { userId });
      return await apiClient.post(endpoint, updates);
    } catch (error) {
      throw this.handleError(error, `Failed to update user ${userId}`);
    }
  }

  // Update user by phone number
  async updateUserByPhone(phoneNumber: string, updates: UpdateUserRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_BY_PHONE, { phoneNumber });
      return await apiClient.post(endpoint, updates);
    } catch (error) {
      throw this.handleError(error, `Failed to update user with phone ${phoneNumber}`);
    }
  }

  // Update specific field by ID
  async updateUserFieldById(userId: number, field: string, value: any): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_FIELD_BY_ID, { userId, field });
      return await apiClient.post(endpoint, { value });
    } catch (error) {
      throw this.handleError(error, `Failed to update field ${field} for user ${userId}`);
    }
  }

  // Update specific field by phone
  async updateUserFieldByPhone(phoneNumber: string, field: string, value: any): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_FIELD_BY_PHONE, { phoneNumber, field });
      return await apiClient.post(endpoint, { value });
    } catch (error) {
      throw this.handleError(error, `Failed to update field ${field} for user with phone ${phoneNumber}`);
    }
  }

  // Bulk update users
  async bulkUpdateUsers(request: BulkUpdateRequest): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(API_ENDPOINTS.USER_UPDATE.BULK_UPDATE, request);
    } catch (error) {
      throw this.handleError(error, 'Failed to bulk update users');
    }
  }

  // Update user status
  async updateUserStatus(userId: number, request: StatusUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_STATUS, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update status for user ${userId}`);
    }
  }

  // Update listener status
  async updateListenerStatus(userId: number, request: StatusUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_LISTENER_STATUS, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update listener status for user ${userId}`);
    }
  }

  // Update user category
  async updateUserCategory(userId: number, request: CategoryUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_CATEGORY, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update category for user ${userId}`);
    }
  }

  // Update user state
  async updateUserState(userId: number, request: StateUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_STATE, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update state for user ${userId}`);
    }
  }

  // Update profile photo
  async updateUserProfilePhoto(userId: number, request: ProfilePhotoUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_PROFILE_PHOTO, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update profile photo for user ${userId}`);
    }
  }

  // Update email
  async updateUserEmail(userId: number, request: EmailUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_EMAIL, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update email for user ${userId}`);
    }
  }

  // Update mobile number
  async updateUserMobile(userId: number, request: MobileUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_MOBILE, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update mobile for user ${userId}`);
    }
  }

  // Update full name
  async updateUserFullName(userId: number, request: FullNameUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_FULL_NAME, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update full name for user ${userId}`);
    }
  }

  // Update username
  async updateUserUsername(userId: number, request: UsernameUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_USERNAME, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update username for user ${userId}`);
    }
  }

  // Update bio
  async updateUserBio(userId: number, request: BioUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_BIO, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update bio for user ${userId}`);
    }
  }

  // Update age
  async updateUserAge(userId: number, request: AgeUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_AGE, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update age for user ${userId}`);
    }
  }

  // Update gender
  async updateUserGender(userId: number, request: GenderUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_GENDER, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update gender for user ${userId}`);
    }
  }

  // Update profession
  async updateUserProfession(userId: number, request: ProfessionUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_PROFESSION, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update profession for user ${userId}`);
    }
  }

  // Update qualification
  async updateUserQualification(userId: number, request: QualificationUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_QUALIFICATION, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update qualification for user ${userId}`);
    }
  }

  // Update experience
  async updateUserExperience(userId: number, request: ExperienceUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_EXPERIENCE, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update experience for user ${userId}`);
    }
  }

  // Update specialization
  async updateUserSpecialization(userId: number, request: SpecializationUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_SPECIALIZATION, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update specialization for user ${userId}`);
    }
  }

  // Update consultation fee
  async updateUserConsultationFee(userId: number, request: ConsultationFeeUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_CONSULTATION_FEE, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update consultation fee for user ${userId}`);
    }
  }

  // Update per minute cost
  async updateUserPerMinuteCost(userId: number, request: PerMinuteCostUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_PER_MINUTE_COST, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update per minute cost for user ${userId}`);
    }
  }

  // Update chat per minute cost
  async updateUserChatPerMinuteCost(userId: number, request: ChatPerMinuteCostUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_CHAT_PER_MINUTE_COST, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update chat per minute cost for user ${userId}`);
    }
  }

  // Update commission percentage
  async updateUserCommissionPer(userId: number, request: CommissionPerUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_COMMISSION_PER, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update commission percentage for user ${userId}`);
    }
  }

  // Update chat commission percentage
  async updateUserChatCommissionPer(userId: number, request: ChatCommissionPerUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_CHAT_COMMISSION_PER, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update chat commission percentage for user ${userId}`);
    }
  }

  // Update KYC status
  async updateUserKycStatus(userId: number, request: KycStatusUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_KYC_STATUS, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update KYC status for user ${userId}`);
    }
  }

  // Update doctor profile status
  async updateUserDoctorProfileStatus(userId: number, request: DoctorProfileStatusUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_DOCTOR_PROFILE_STATUS, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update doctor profile status for user ${userId}`);
    }
  }

  // Update audit log
  async updateUserAuditLog(userId: number, request: AuditLogUpdateRequest): Promise<ApiResponse<any>> {
    try {
      const endpoint = apiClient.buildUrl(API_ENDPOINTS.USER_UPDATE.UPDATE_AUDIT_LOG, { userId });
      return await apiClient.post(endpoint, request);
    } catch (error) {
      throw this.handleError(error, `Failed to update audit log for user ${userId}`);
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
export const userUpdateAPI = new UserUpdateAPI();

