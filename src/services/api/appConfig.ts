import { apiClient } from './base';

export type AppConfigValue = boolean | number | string;
export type AppConfigData = Record<string, AppConfigValue>;

export type AppConfigResponse = {
  success: boolean;
  data: AppConfigData;
  defaults: AppConfigData;
  keys: string[];
  message?: string;
  errors?: string[];
};

/** @deprecated Use AppConfigData — kept for backwards compatibility */
export type UserAppConfig = {
  chatFeature: boolean;
  callFeature: boolean;
  communityFeature: boolean;
  astroApp: boolean;
  allowDebugButtons?: boolean;
  [key: string]: AppConfigValue | undefined;
};

export type PartnerAppConfig = {
  astroApp: boolean;
  allowDebug: boolean;
  [key: string]: AppConfigValue | undefined;
};

export const appConfigAPI = {
  getUserAppConfig: async (): Promise<AppConfigResponse> => {
    const res = await apiClient.get<AppConfigData>('/app/user-app-config');
    return res as unknown as AppConfigResponse;
  },

  updateUserAppConfigPartial: async (
    patch: Partial<AppConfigData>
  ): Promise<AppConfigResponse> => {
    const res = await apiClient.post<AppConfigData>('/app/user-app-config', patch);
    return res as unknown as AppConfigResponse;
  },

  getPartnerAppConfig: async (): Promise<AppConfigResponse> => {
    const res = await apiClient.get<AppConfigData>('/app/partner-app-config');
    return res as unknown as AppConfigResponse;
  },

  updatePartnerAppConfigPartial: async (
    patch: Partial<AppConfigData>
  ): Promise<AppConfigResponse> => {
    const res = await apiClient.post<AppConfigData>('/app/partner-app-config', patch);
    return res as unknown as AppConfigResponse;
  },
};
