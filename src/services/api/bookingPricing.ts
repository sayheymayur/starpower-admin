import { apiClient } from './base';
import type { BookingCouponPreviewMeta } from './bookingCoupons';

export type BookingPricingConfig = {
  basePrice: number;
  gstPercent: number;
};

export type BookingPricingSample = {
  basePrice: number;
  couponCode: string | null;
  discounts: unknown[];
  totalDiscount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  payableAmount: number;
  currency: string;
  state: string;
};

export type BookingPricingData = {
  config: BookingPricingConfig;
  defaults: BookingPricingConfig;
  preview: BookingCouponPreviewMeta;
  sampleNoCoupon: BookingPricingSample;
};

export type BookingPricingGetResponse = {
  success: boolean;
  data: BookingPricingData;
  message?: string;
  errors?: string[];
};

export type BookingPricingUpdateData = {
  config: BookingPricingConfig;
  preview: BookingCouponPreviewMeta;
  sampleNoCoupon?: BookingPricingSample;
};

export type BookingPricingUpdateResponse = {
  success: boolean;
  data: BookingPricingUpdateData;
  message?: string;
  errors?: string[];
};

export type BookingPricingParams = {
  state?: string;
};

function withStateQuery(endpoint: string, params?: BookingPricingParams): string {
  if (!params?.state) return endpoint;
  return `${endpoint}?state=${encodeURIComponent(params.state)}`;
}

export const bookingPricingAPI = {
  get: async (params?: BookingPricingParams): Promise<BookingPricingGetResponse> => {
    const res = await apiClient.get<BookingPricingData>('/booking-pricing', params);
    return res as unknown as BookingPricingGetResponse;
  },

  update: async (
    input: Partial<BookingPricingConfig>,
    params?: BookingPricingParams
  ): Promise<BookingPricingUpdateResponse> => {
    const res = await apiClient.put<BookingPricingUpdateData>(
      withStateQuery('/booking-pricing', params),
      input
    );
    return res as unknown as BookingPricingUpdateResponse;
  },
};
