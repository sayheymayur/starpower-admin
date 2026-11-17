/**
 * Comprehensive Dashboard API Service
 * Handles all API calls for the Dashboard application
 */

import { authService, UNAUTHORIZED_EVENT } from './auth/dashboardAuth';

const BASE_URL = 'https://paapi.sayhey.co.in/api/dashboard/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class DashboardAPIService {
  private baseURL: string;

  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
  }

  private buildAuthHeaders(optionHeaders?: HeadersInit): Record<string, string> {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(optionHeaders as Record<string, string> | undefined),
    };
  }

  private handleAuthFailure(status: number, _message?: string): void {
    if (status !== 401) return;
    authService.handleUnauthorized();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const { headers: optionHeaders, ...rest } = options;

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...rest,
        headers: this.buildAuthHeaders(optionHeaders),
      });

      const data = await response.json();

      if (response.status === 401) {
        this.handleAuthFailure(response.status);
        throw new Error(data.message ?? 'Session expired. Please log in again.');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const { headers: optionHeaders, ...rest } = options;
    const response = await fetch(url, {
      ...rest,
      headers: this.buildAuthHeaders(optionHeaders),
    });

    const data = await response.json();

    if (response.status === 401) {
      this.handleAuthFailure(response.status);
      throw new Error(data.message ?? 'Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(data.message ?? `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // ==================== USER MANAGEMENT ====================
  
  async getUsers(filters: {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    status?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/userdata/getallusers?${queryParams}`);
  }

  async getListeners(filters: any = {}) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`/userdata/getalllisteners?${queryParams}`);
  }

  // Enhanced Listeners API - using enhanced user data for listeners
  async getEnhancedListeners(filters: any = {}) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`/enhanced-userdata/comprehensive?${queryParams}&is_doctor=1`);
  }

  async getEnhancedListenerDetails(userId: number) {
    return this.request(`/enhanced-userdata/comprehensive/${userId}`);
  }

  async getUserStats() {
    return this.request('/userdata/stats');
  }

  async getUserById(userId: number) {
    return this.request(`/userdata/getuserbyid/${userId}`);
  }

  async getEnhancedUserDetails(userId: number) {
    return this.request(`/enhanced-userdata/comprehensive/${userId}`);
  }

  async getEnhancedUsers(filters: any = {}) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`/enhanced-userdata/comprehensive?${queryParams}`);
  }

  async searchUsersByPhone(phoneNumber: string) {
    return this.request(`/enhanced-userdata/search-by-phone/${encodeURIComponent(phoneNumber)}`);
  }

  // ==================== SESSION MANAGEMENT ====================
  
  async getSessions(filters: {
    page?: number;
    limit?: number;
    status?: string;
    missed?: boolean | string;
    missedType?: string;
    startDate?: string;
    endDate?: string;
    dateField?: string;
    sessionType?: number | string;
    listenerId?: number | string;
    search?: string;
    userName?: string;
    listenerName?: string;
    phoneNumber?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    return this.request(`/sessions/allsessions?${queryParams}`);
  }

  async getMissedSessions(filters: {
    page?: number;
    limit?: number;
    missedType?: string;
    startDate?: string;
    endDate?: string;
    dateField?: string;
    sessionType?: number | string;
    listenerId?: number | string;
    search?: string;
    userName?: string;
    listenerName?: string;
    phoneNumber?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    return this.request(`/sessions/missed?${queryParams}`);
  }

  async getSessionsByUser(userId: number) {
    return this.request(`/sessions/user/${userId}`);
  }

  async getSessionsByListener(listenerId: number, filters: {
    page?: number;
    limit?: number;
    status?: string;
    missed?: boolean | string;
    missedType?: string;
    startDate?: string;
    endDate?: string;
    dateField?: string;
    sessionType?: number | string;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    const qs = queryParams.toString();
    return this.request(`/sessions/listener/${listenerId}${qs ? `?${qs}` : ''}`);
  }

  async getSessionsByDate(startDate: string, endDate: string) {
    return this.request(`/sessions/bydate?startDate=${startDate}&endDate=${endDate}`);
  }

  async getSessionStats() {
    return this.request('/sessions/stats');
  }

  async getSessionDetails(sessionId: number | string) {
    return this.request(`/sessions/details/${sessionId}`);
  }

  // ==================== WALLET & FINANCIAL ====================
  
  // Wallet Management
  async getWallets(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    minAmount?: number;
    maxAmount?: number;
    orderBy?: string;
    order?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/wallets?${queryParams}`);
  }

  async getWalletByUserId(userId: number) {
    return this.request(`/wallet/wallets/user/${userId}`);
  }

  async getWalletBalance(userId: number) {
    return this.request(`/wallet/wallets/user/${userId}/balance`);
  }

  async getWalletsByBalanceRange(minAmount: number, maxAmount: number, page = 1, limit = 20) {
    return this.request(`/wallet/wallets/balance-range?minAmount=${minAmount}&maxAmount=${maxAmount}&page=${page}&limit=${limit}`);
  }

  async getWalletsByDateRange(startDate: string, endDate: string, page = 1, limit = 20) {
    return this.request(`/wallet/wallets/bydate?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
  }

  async getWalletStats() {
    return this.request('/wallet/wallets/stats');
  }

  async getTopWallets(limit = 10) {
    return this.request(`/wallet/wallets/top?limit=${limit}`);
  }

  async getZeroBalanceWallets(page = 1, limit = 20) {
    return this.request(`/wallet/wallets/zero-balance?page=${page}&limit=${limit}`);
  }

  // Wallet Transactions
  async getWalletTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
    isCredit?: boolean;
    stateId?: number;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions?${queryParams}`);
  }

  async getWalletTransactionsByUser(userId: number, filters: {
    page?: number;
    limit?: number;
    status?: string;
    isCredit?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions/user/${userId}?${queryParams}`);
  }

  async getWalletTransactionsByDateRange(startDate: string, endDate: string, filters: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
    isCredit?: boolean;
    stateId?: number;
  } = {}) {
    const queryParams = new URLSearchParams({ startDate, endDate, ...filters } as any);
    return this.request(`/wallet/transactions/bydate?${queryParams}`);
  }

  async getCreditTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions/credits?${queryParams}`);
  }

  async getDebitTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions/debits?${queryParams}`);
  }

  async getSuccessfulTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions/successful?${queryParams}`);
  }

  async getPendingTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions/pending?${queryParams}`);
  }

  async getTransactionByOrderId(orderId: string) {
    return this.request(`/wallet/transactions/order/${orderId}`);
  }

  async getTransactionByPaymentId(paymentId: string) {
    return this.request(`/wallet/transactions/payment/${paymentId}`);
  }

  async getTransactionsByState(stateId: number, page = 1, limit = 20) {
    return this.request(`/wallet/transactions/state/${stateId}?page=${page}&limit=${limit}`);
  }

  async getTransactionStats(filters: {
    startDate?: string;
    endDate?: string;
    userId?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/transactions/stats?${queryParams}`);
  }

  // Razorpay Transactions
  async getRazorpayTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/razorpay/transactions?${queryParams}`);
  }

  async getRazorpayTransactionsByUser(userId: number, filters: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/razorpay/transactions/user/${userId}?${queryParams}`);
  }

  async getRazorpayTransactionsByDateRange(startDate: string, endDate: string, filters: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
  } = {}) {
    const queryParams = new URLSearchParams({ startDate, endDate, ...filters } as any);
    return this.request(`/wallet/razorpay/transactions/bydate?${queryParams}`);
  }

  async getRazorpayStats(filters: {
    startDate?: string;
    endDate?: string;
    userId?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/razorpay/stats?${queryParams}`);
  }

  // Account Transactions
  async getAccountTransactions(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    transactionType?: string;
    isCredit?: boolean;
    isDebit?: boolean;
    paidByAdmin?: boolean;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/account/transactions?${queryParams}`);
  }

  async getAccountTransactionsByUser(userId: number, filters: {
    page?: number;
    limit?: number;
    transactionType?: string;
    isCredit?: boolean;
    isDebit?: boolean;
    paidByAdmin?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/account/transactions/user/${userId}?${queryParams}`);
  }

  async getAccountTransactionsByDateRange(startDate: string, endDate: string, filters: {
    page?: number;
    limit?: number;
    userId?: number;
    transactionType?: string;
    isCredit?: boolean;
    isDebit?: boolean;
    paidByAdmin?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams({ startDate, endDate, ...filters } as any);
    return this.request(`/wallet/account/transactions/bydate?${queryParams}`);
  }

  async getAccountTransactionsByType(transactionType: string, page = 1, limit = 20) {
    return this.request(`/wallet/account/transactions/type/${transactionType}?page=${page}&limit=${limit}`);
  }

  async getAccountStats(filters: {
    userId?: number;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/wallet/account/stats?${queryParams}`);
  }

  // Wallet Update Operations
  async updateWalletBalance(userId: number, data: {
    amount: number;
    reason: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/wallet/wallets/user/${userId}/update-balance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addAmountToWallet(userId: number, data: {
    amount: number;
    reason: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/wallet/wallets/user/${userId}/add`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deductAmountFromWallet(userId: number, data: {
    amount: number;
    reason: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/wallet/wallets/user/${userId}/deduct`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetWalletBalance(userId: number, data: {
    reason: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/wallet/wallets/user/${userId}/reset`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransactionStatus(transactionId: number, data: {
    status: number;
    remark: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/wallet/transactions/${transactionId}/update-status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransactionRemark(transactionId: number, data: {
    remark: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/wallet/transactions/${transactionId}/update-remark`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateWalletBalances(data: {
    updates: Array<{
      userId: number;
      amount: number;
      type: 'set' | 'add' | 'deduct';
    }>;
    reason: string;
    updatedBy: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/wallet/wallets/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Legacy method for backward compatibility
  async updateWallet(updateData: {
    userId: number;
    amount: number;
    transactionType: string;
    remark: string;
    isCredit: boolean;
  }) {
    return this.request('/wallet/update', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  // Alias methods for UpdateWallet component
  async addWalletAmount(userId: number, amount: number) {
    return this.addAmountToWallet(userId, { amount, reason: 'Admin credit', updatedBy: 1 });
  }

  async deductWalletAmount(userId: number, amount: number) {
    return this.deductAmountFromWallet(userId, { amount, reason: 'Admin debit', updatedBy: 1 });
  }

  async setWalletAmount(userId: number, amount: number) {
    return this.updateWalletBalance(userId, { amount, reason: 'Admin set balance', updatedBy: 1 });
  }

  // ==================== USER UPDATE OPERATIONS ====================
  
  // Individual User Updates
  async updateUserByUserId(userId: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserByPhone(phoneNumber: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Field-specific Updates
  async updateUserFieldByUserId(userId: number, fieldName: string, value: any): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/field/${fieldName}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  async updateUserFieldByPhone(phoneNumber: string, fieldName: string, value: any): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/field/${fieldName}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  // Bulk Updates
  async bulkUpdateUsers(data: {
    userIds?: number[];
    phoneNumbers?: string[];
    updateData: any;
  }): Promise<ApiResponse<any>> {
    return this.request('/user-update/users/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Status Management
  async updateUserStatusByUserId(userId: number, data: {
    status: number;
    reason: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserStatusByPhone(phoneNumber: string, data: {
    status: number;
    reason: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Profile Updates
  async updateUserProfileByUserId(userId: number, data: {
    full_name?: string;
    bio?: string;
    profile_photo?: string;
    dob?: string;
    gender?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/profile`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserProfileByPhone(phoneNumber: string, data: {
    full_name?: string;
    bio?: string;
    profile_photo?: string;
    dob?: string;
    gender?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/profile`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contact Updates
  async updateUserContactByUserId(userId: number, data: {
    mobile_no?: string;
    email_id?: string;
    fcm_token?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserContactByPhone(phoneNumber: string, data: {
    mobile_no?: string;
    email_id?: string;
    fcm_token?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Location Updates
  async updateUserLocationByUserId(userId: number, data: {
    latitude?: string;
    longitude?: string;
    state_id_fk?: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/location`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserLocationByPhone(phoneNumber: string, data: {
    latitude?: string;
    longitude?: string;
    state_id_fk?: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/location`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Professional Updates
  async updateUserProfessionalByUserId(userId: number, data: {
    is_doctor?: number;
    per_minute_cost?: number;
    commission_per?: number;
    chat_per_minute_cost?: number;
    chat_commission_per?: number;
    assessment_certi?: string;
    qualification_proof?: string;
    doctor_profile_status?: number;
    pan_no?: string;
    topic_ids?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/professional`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserProfessionalByPhone(phoneNumber: string, data: {
    is_doctor?: number;
    per_minute_cost?: number;
    commission_per?: number;
    chat_per_minute_cost?: number;
    chat_commission_per?: number;
    assessment_certi?: string;
    qualification_proof?: string;
    doctor_profile_status?: number;
    pan_no?: string;
    topic_ids?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/professional`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Preferences Updates
  async updateUserPreferencesByUserId(userId: number, data: {
    prefered_language?: string;
    app_platform?: string;
    device_id?: string;
    is_avatar?: boolean;
    is_brand_ambassador?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/preferences`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserPreferencesByPhone(phoneNumber: string, data: {
    prefered_language?: string;
    app_platform?: string;
    device_id?: string;
    is_avatar?: boolean;
    is_brand_ambassador?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/preferences`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // KYC Updates
  async updateUserKycByUserId(userId: number, data: {
    kyc_status: number;
    reason: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/kyc`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserKycByPhone(phoneNumber: string, data: {
    kyc_status: number;
    reason: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/kyc`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Account Management
  async deactivateUserByUserId(userId: number, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async deactivateUserByPhone(phoneNumber: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUserByUserId(userId: number): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/${userId}/activate`, {
      method: 'POST',
    });
  }

  async activateUserByPhone(phoneNumber: string): Promise<ApiResponse<any>> {
    return this.request(`/user-update/user/phone/${phoneNumber}/activate`, {
      method: 'POST',
    });
  }

  // Update History
  async getUserUpdateHistoryByUserId(userId: number, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/user-update/user/${userId}/history?${params.toString()}`);
  }

  async getUserUpdateHistoryByPhone(phoneNumber: string, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/user-update/user/phone/${phoneNumber}/history?${params.toString()}`);
  }

  // Doctor Availability Status Updates
  async updateDoctorAvailabilityStatusByUserId(userId: number, data: {
    avail_status: number;
    created_by: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/doctor-availability/doctor/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctorAvailabilityStatusByPhone(phoneNumber: string, data: {
    avail_status: number;
    created_by: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/doctor-availability/doctor/phone/${phoneNumber}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== CONTENT MANAGEMENT ====================
  
  async getPosts(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: number;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/posts?${params.toString()}`);
  }

  async getPostById(postId: number): Promise<ApiResponse<any>> {
    return this.request(`/posts/${postId}`);
  }

  async getPostsByUser(userId: number, filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/posts/user/${userId}?${params.toString()}`);
  }

  async getPostsByCategory(categoryId: number, filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/posts/category/${categoryId}?${params.toString()}`);
  }

  async getPostStatistics(filters: {
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/posts/statistics?${params.toString()}`);
  }

  async getPostReports(filters: {
    page?: number;
    limit?: number;
    search?: string;
    reportType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/posts/reports?${params.toString()}`);
  }

  async getPostReportStats(): Promise<ApiResponse<any>> {
    return this.request('/posts/reports/statistics');
  }

  async getPostStats() {
    return this.request('/posts/stats');
  }

  async deletePost(postId: number): Promise<ApiResponse<any>> {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async deleteComment(postId: number, commentId: number): Promise<ApiResponse<any>> {
    return this.request(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // ==================== COMMUNICATION ====================
  
  async getNotifications(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    type?: string;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/notifications?${queryParams}`);
  }

  async getFCMTokens() {
    return this.request('/notifications/fcm-tokens');
  }

  // ==================== ANALYTICS ====================
  
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getUserAnalytics() {
    return this.request('/analytics/users');
  }

  // ==================== ACTIVITY TRACKING ====================
  
  async getLatestActivity(limit = 50) {
    return this.request(`/activity/latest?limit=${limit}`);
  }

  async getUserActivity(userId: number, limit = 50) {
    return this.request(`/activity/user/${userId}?limit=${limit}`);
  }

  // ==================== DOCTOR MANAGEMENT ====================
  
  async getDoctorAvailability(filters: {
    userId?: number;
    status?: number;
  } = {}) {
    const queryParams = new URLSearchParams(filters as any);
    return this.request(`/doctor-availability?${queryParams}`);
  }

  async getAvailabilityStats() {
    return this.request('/doctor-availability/stats');
  }

  async getDoctorAvailabilityStatuses(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    date?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/doctor-availability/statuses?${params.toString()}`);
  }

  async getDoctorAvailabilityStats(): Promise<ApiResponse<any>> {
    return this.request('/doctor-availability/statistics');
  }

  async updateDoctorStatus(statusId: number, data: {
    status: number;
    reason?: string | null;
  }): Promise<ApiResponse<any>> {
    return this.request(`/doctor-availability/status/${statusId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateDoctorStatuses(data: {
    statusIds: number[];
    status: number;
    reason?: string | null;
  }): Promise<ApiResponse<any>> {
    return this.request('/doctor-availability/doctors/bulk-status', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDoctorAvailabilityByUserId(userId: number): Promise<ApiResponse<any>> {
    return this.request(`/doctor-availability/doctor/${userId}/status`);
  }

  async updateDoctorAvailabilityByUserId(userId: number, data: {
    status: number;
    reason?: string | null;
  }): Promise<ApiResponse<any>> {
    return this.request(`/doctor-availability/doctor/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDoctorAvailabilityHistory(userId: number, filters: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/doctor-availability/doctor/${userId}/history?${params.toString()}`);
  }

  async getAvailableDoctors(filters: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/doctor-availability/doctors/available?${params.toString()}`);
  }

  async getUnavailableDoctors(filters: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/doctor-availability/doctors/unavailable?${params.toString()}`);
  }

  // ==================== UPDATE OPERATIONS ====================
  
  async updateUser(userId: number, updateData: any) {
    return this.request(`/user-update/update-user-by-id/${userId}`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  async updateUserEnhanced(userId: number, updateData: any) {
    return this.request(`/enhanced-user-update/enhanced/${userId}`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }


  async updateUserStatus(userId: number, status: number, reason?: string) {
    return this.request(`/enhanced-user-update/enhanced/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  }

  async updateSession(sessionId: number, updateData: any) {
    return this.request(`/session-update/update-session/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  // Ratings API Methods
  async getAllRatings(filters: {
    page?: number;
    limit?: number;
    byUserId?: number;
    toUserId?: number;
    minRating?: number;
    maxRating?: number;
    hasComments?: boolean;
    orderBy?: string;
    order?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/ratings/ratings?${params.toString()}`);
  }

  async getRatingById(ratingId: number): Promise<ApiResponse<any>> {
    return this.request(`/ratings/ratings/${ratingId}`);
  }

  async getRatingsByUser(userId: number, filters: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/ratings/ratings/by-user/${userId}?${params.toString()}`);
  }

  async getRatingsReceivedByUser(userId: number, filters: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/ratings/ratings/received-by-user/${userId}?${params.toString()}`);
  }

  async getRatingsByValue(rating: number, filters: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/ratings/ratings/value/${rating}?${params.toString()}`);
  }

  async getRatingsWithComments(filters: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/ratings/ratings/with-comments?${params.toString()}`);
  }

  async getRatingStats(filters: {
    userId?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/ratings/ratings/stats?${params.toString()}`);
  }

  async getUserRatingSummary(userId: number): Promise<ApiResponse<any>> {
    return this.request(`/ratings/ratings/user-summary/${userId}`);
  }

  // Invoice API Methods
  private async invoiceRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const invoiceBaseURL = 'https://paapi.sayhey.co.in/public/api';
    try {
      const response = await fetch(`${invoiceBaseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Invoice API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  async getAllInvoices(filters: {
    page?: number;
    limit?: number;
    userId?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.invoiceRequest(`/invoices/all?${params.toString()}`);
  }

  async getUserInvoices(userId: number, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.invoiceRequest(`/invoices/user/${userId}?${params.toString()}`);
  }

  async getUserInvoicesByPhone(phoneNumber: string, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.invoiceRequest(`/invoices/phone/${encodeURIComponent(phoneNumber)}?${params.toString()}`);
  }

  async getInvoiceByOrderId(userId: number, orderId: string): Promise<ApiResponse<any>> {
    return this.invoiceRequest(`/invoices/user/${userId}/order/${orderId}`);
  }

  async downloadInvoice(userId: number, filename: string): Promise<Blob> {
    const invoiceBaseURL = 'https://paapi.sayhey.co.in/public/api';
    const response = await fetch(`${invoiceBaseURL}/invoices/user/${userId}/download/${filename}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return response.blob();
  }

  async getInvoiceStats(): Promise<ApiResponse<any>> {
    return this.invoiceRequest('/invoices/stats');
  }

  // Admin Notification API Methods
  private async notificationRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const notificationBaseURL = 'https://paapi.sayhey.co.in/api/notification/admin';
    try {
      return await this.fetchWithAuth<T>(`${notificationBaseURL}${endpoint}`, options);
    } catch (error) {
      console.error('Notification API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  async sendNotificationToUser(userId: number, data: {
    title: string;
    body: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    log?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest(`/send/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendNotificationToPhone(phoneNumber: string, data: {
    title: string;
    body: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    log?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest(`/send/phone/${phoneNumber}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendBulkNotifications(data: {
    userIds: number[];
    title: string;
    body: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    log?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest('/send/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendNotificationToAll(data: {
    title: string;
    body: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    userType?: 'all' | 'doctors' | 'users' | 'listeners';
    log?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest('/send/all', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scheduleNotificationForUser(userId: number, data: {
    title: string;
    body: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduleFor: string;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest(`/schedule/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scheduleGlobalNotification(data: {
    title: string;
    body: string;
    metadata?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    userType?: 'all' | 'doctors' | 'users' | 'listeners';
    scheduleFor: string;
    isRecurringDaily?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest('/schedule/global', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendNotificationToToken(data: {
    fcmToken: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    imageUrl?: string;
  }): Promise<ApiResponse<any>> {
    // Use direct request for /api/notifications/send-to-token endpoint
    const notificationBaseURL = 'https://paapi.sayhey.co.in/api/notification';
    try {
      return await this.fetchWithAuth<any>(`${notificationBaseURL}/send-to-token`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Send notification to token failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  async scheduleNotification(data: {
    userId: number;
    title: string;
    body: string;
    metadata?: Record<string, any>;
    scheduledFor: string;
  }): Promise<ApiResponse<any>> {
    return this.notificationRequest('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getNotificationStats(filters: {
    startDate?: string;
    endDate?: string;
    userId?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.notificationRequest(`/stats?${params.toString()}`);
  }

  async getNotificationHistory(filters: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: 'sent' | 'failed' | 'scheduled' | 'cancelled';
    startDate?: string;
    endDate?: string;
    userType?: 'all' | 'doctors' | 'users' | 'listeners';
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, value.toString());
      }
    });

    return this.notificationRequest(`/history?${params.toString()}`);
  }

  async cancelScheduledNotification(notificationId: number): Promise<ApiResponse<any>> {
    return this.notificationRequest(`/cancel/${notificationId}`, {
      method: 'POST',
    });
  }

  // Service Monitoring APIs
  async getAllServices(): Promise<ApiResponse<any>> {
    return this.request('/services');
  }

  async getServicesStatus(includeDown: boolean = true): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('includeDown', includeDown.toString());
    return this.request(`/services/status?${params.toString()}`);
  }

  async getServiceStatus(serviceName: string): Promise<ApiResponse<any>> {
    return this.request(`/services/status/${serviceName}`);
  }

  async getServicesHealth(): Promise<ApiResponse<any>> {
    return this.request('/services/health');
  }

  // ==================== CHAT MANAGEMENT ====================
  
  // Chat API uses /api/chats or /api/dashboard/chats base path
  // Using /api/dashboard/chats to match the dashboard API pattern
  private async chatRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const chatBaseURL = 'https://paapi.sayhey.co.in/api/dashboard/api/chats';
    try {
      return await this.fetchWithAuth<T>(`${chatBaseURL}${endpoint}`, options);
    } catch (error) {
      console.error('Chat API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }
  
  async getChatsForUser(userId: string | number, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    return this.chatRequest(`/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async getChatById(chatId: number): Promise<ApiResponse<any>> {
    return this.chatRequest(`/${chatId}`);
  }

  async getChatMessages(chatId: number, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    return this.chatRequest(`/${chatId}/messages${queryString ? `?${queryString}` : ''}`);
  }

  async getChatMessagesGrouped(chatId: number, filters: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    return this.chatRequest(`/${chatId}/messages/grouped${queryString ? `?${queryString}` : ''}`);
  }

  async ensureChatExists(data: {
    userId: string | number;
    listenerId: string | number;
  }): Promise<ApiResponse<any>> {
    return this.chatRequest('/ensure', {
      method: 'POST',
      body: JSON.stringify({
        userId: String(data.userId),
        listenerId: String(data.listenerId),
      }),
    });
  }

  // ==================== SESSION REPORTS ====================
  
  async getSessionReports(filters: {
    period?: 'daily' | 'weekly' | 'monthly' | 'custom';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    return this.request(`/session-reports${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== LISTENER BANK MANAGEMENT ====================

  async getListenerBanks(filters: {
    page?: number;
    limit?: number;
    status?: number | string;
    state?: string;
    search?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return this.request(`/listener-banks${queryString ? `?${queryString}` : ''}`);
  }

  async getListenerBankByListener(listenerId: number): Promise<ApiResponse<any>> {
    return this.request(`/listener-banks/${listenerId}`);
  }

  async createListenerBank(data: {
    userId: number;
    createdBy: number;
    fullName?: string;
    accountNo?: string;
    ifscCode?: string;
    micr?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    status?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/listener-banks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateListenerBank(listenerId: number, data: {
    fullName?: string;
    accountNo?: string;
    ifscCode?: string;
    micr?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    status?: number;
  }): Promise<ApiResponse<any>> {
    return this.request(`/listener-banks/${listenerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== LISTENER PAYOUTS ====================

  async getListenerEarningsLast7Days(): Promise<ApiResponse<any>> {
    return this.request('/payouts/listener-earnings-last-7-days');
  }

  // User Payout API - Get listener balances (payout amounts)
  async getListenerBalances(filters: {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    minBalance?: number;
    maxBalance?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.state) params.append('state', filters.state);
    if (filters.minBalance !== undefined) params.append('minBalance', filters.minBalance.toString());
    if (filters.maxBalance !== undefined) params.append('maxBalance', filters.maxBalance.toString());

    const queryString = params.toString();
    return this.request(`/payouts/listener-balances${queryString ? `?${queryString}` : ''}`);
  }

  // Get listener balance by ID
  async getListenerBalanceById(listenerId: number): Promise<ApiResponse<any>> {
    return this.request(`/payouts/listener-balance/${listenerId}`);
  }

  async createPayout(data: {
    userId: number;
    totalAmount: number;
    payoutByAdminId: number;
    createdBy: number;
    payoutDateTime?: string;
    paymentId?: string;
    remark?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/payouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== LISTENER APPROVAL ====================
  async getPendingListeners(filters: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    return this.request(`/listeners/pending${queryString ? `?${queryString}` : ''}`);
  }

  async updateListenerStatus(userId: number, data: {
    doctorProfileStatus: number;
    rejectedRemark?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/listeners/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== PM2 MONITORING ====================
  
  async getPM2Processes(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/pm2/processes');
  }

  async getPM2Process(processId: string | number): Promise<ApiResponse<any>> {
    return this.request(`/monitoring/pm2/processes/${processId}`);
  }

  async getPM2Streams(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/pm2/streams');
  }

  // ==================== SYSTEM MONITORING ====================
  
  async getHealthCheck(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/health');
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/health/system');
  }

  async getDatabaseHealth(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/health/database');
  }

  async getRedisHealth(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/health/redis');
  }

  async getSystemMetrics(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/metrics/system');
  }

  async getAPIMetrics(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/metrics/api');
  }

  async resetMetrics(): Promise<ApiResponse<any>> {
    return this.request('/monitoring/metrics/reset', { method: 'POST' });
  }

  // ==================== TODO/TASK MANAGEMENT ====================
  
  // Note: Todos API uses different base path - using direct API paths
  // The API docs show both /api/todos/... and /api/dashboard/todos/... work
  // Since BASE_URL is /api/dashboard/api, we need to use relative paths that match /api/dashboard/todos/...
  
  private async todosRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const baseURL = 'https://paapi.sayhey.co.in/api/dashboard/api';
    return this.fetchWithAuth<T>(`${baseURL}${endpoint}`, options);
  }
  
  // Group Management
  async createGroup(data: {
    name: string;
    description?: string;
    color?: string;
    createdBy?: string;
  }): Promise<ApiResponse<any>> {
    return this.todosRequest('/todos/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllGroups(): Promise<ApiResponse<any>> {
    return this.todosRequest('/todos/groups');
  }

  async getGroupById(groupId: string): Promise<ApiResponse<any>> {
    return this.todosRequest(`/todos/groups/${groupId}`);
  }

  async updateGroup(groupId: string, data: {
    name?: string;
    description?: string;
    color?: string;
  }): Promise<ApiResponse<any>> {
    return this.todosRequest(`/todos/groups/${groupId}/update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(groupId: string): Promise<ApiResponse<any>> {
    return this.todosRequest(`/todos/groups/${groupId}/delete`, {
      method: 'POST',
    });
  }

  // Task Management
  async createTask(data: {
    title: string;
    description?: string;
    group: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'draft' | 'active' | 'completed' | 'cancelled';
    eta?: string;
    createdBy?: string;
    assignedTo?: string;
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    return this.todosRequest('/todos/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllTasks(filters: {
    group?: string;
    status?: string;
    priority?: string;
    search?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters.group) params.append('group', filters.group);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    return this.todosRequest(`/todos/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTaskById(taskId: string): Promise<ApiResponse<any>> {
    return this.todosRequest(`/todos/tasks/${taskId}`);
  }

  async updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    group?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'draft' | 'active' | 'completed' | 'cancelled';
    eta?: string;
    assignedTo?: string;
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    return this.todosRequest(`/todos/tasks/${taskId}/update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse<any>> {
    return this.todosRequest(`/todos/tasks/${taskId}/delete`, {
      method: 'POST',
    });
  }

  // Statistics
  async getTaskStats(groupId?: string): Promise<ApiResponse<any>> {
    const queryString = groupId ? `?group=${groupId}` : '';
    return this.todosRequest(`/todos/stats${queryString}`);
  }
}

export const dashboardAPI = new DashboardAPIService();
export default dashboardAPI;

