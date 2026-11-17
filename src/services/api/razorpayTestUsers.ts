import { apiClient } from './base';

export type RazorpayTestUsersConfig = {
  userIds: number[];
};

export type RazorpayTestUsersListData = {
  userIds: number[];
  defaults: number[];
  configPath: string;
};

export type RazorpayTestUsersListResponse = {
  success: boolean;
  data: RazorpayTestUsersListData;
  message?: string;
};

export type RazorpayTestUsersMutationResponse = {
  success: boolean;
  data: RazorpayTestUsersConfig;
  message?: string;
};

export type AddRazorpayTestUsersInput =
  | { userId: number }
  | { userIds: number[] };

export const razorpayTestUsersAPI = {
  list: async (): Promise<RazorpayTestUsersListResponse> => {
    const res = await apiClient.get<RazorpayTestUsersListData>('/razorpay/test-users');
    return res as unknown as RazorpayTestUsersListResponse;
  },

  add: async (input: AddRazorpayTestUsersInput): Promise<RazorpayTestUsersMutationResponse> => {
    const res = await apiClient.post<RazorpayTestUsersConfig>('/razorpay/test-users', input);
    return res as unknown as RazorpayTestUsersMutationResponse;
  },

  remove: async (userId: number): Promise<RazorpayTestUsersMutationResponse> => {
    const res = await apiClient.delete<RazorpayTestUsersConfig>(
      `/razorpay/test-users/${userId}`
    );
    return res as unknown as RazorpayTestUsersMutationResponse;
  },
};
