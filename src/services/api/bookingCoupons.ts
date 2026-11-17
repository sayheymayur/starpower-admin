import { apiClient } from './base';

export type BookingCoupon = {
  code: string;
  label: string;
  percent: number;
  description: string;
  enabled: boolean;
};

export type BookingCouponPreview = BookingCoupon & {
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  payableAmount: number;
};

export type BookingCouponPreviewMeta = {
  basePrice: number;
  gstRate: number;
  currency: string;
  state: string;
  coupons: BookingCouponPreview[];
};

export type BookingCouponListData = {
  coupons: BookingCoupon[];
  defaults: BookingCoupon[];
  preview: BookingCouponPreviewMeta;
};

export type BookingCouponListResponse = {
  success: boolean;
  data: BookingCouponListData;
  message?: string;
  errors?: string[];
};

export type BookingCouponResponse = {
  success: boolean;
  data: BookingCoupon;
  message?: string;
  errors?: string[];
};

export type CreateBookingCouponInput = {
  code: string;
  label: string;
  percent: number;
  description: string;
  enabled: boolean;
};

export type UpdateBookingCouponInput = Partial<
  Omit<CreateBookingCouponInput, 'code'>
>;

export type ListBookingCouponsParams = {
  includeDisabled?: boolean;
  state?: string;
};

export const bookingCouponsAPI = {
  list: async (
    params: ListBookingCouponsParams = {}
  ): Promise<BookingCouponListResponse> => {
    const res = await apiClient.get<BookingCouponListData>(
      '/booking-coupons',
      params
    );
    return res as unknown as BookingCouponListResponse;
  },

  get: async (code: string): Promise<BookingCouponResponse> => {
    const res = await apiClient.get<BookingCoupon>(
      `/booking-coupons/${encodeURIComponent(code)}`
    );
    return res as unknown as BookingCouponResponse;
  },

  create: async (
    input: CreateBookingCouponInput
  ): Promise<BookingCouponResponse> => {
    const res = await apiClient.post<BookingCoupon>('/booking-coupons', input);
    return res as unknown as BookingCouponResponse;
  },

  update: async (
    code: string,
    input: UpdateBookingCouponInput
  ): Promise<BookingCouponResponse> => {
    const res = await apiClient.put<BookingCoupon>(
      `/booking-coupons/${encodeURIComponent(code)}`,
      input
    );
    return res as unknown as BookingCouponResponse;
  },

  setEnabled: async (
    code: string,
    enabled: boolean
  ): Promise<BookingCouponResponse> => {
    const res = await apiClient.patch<BookingCoupon>(
      `/booking-coupons/${encodeURIComponent(code)}/enabled`,
      { enabled }
    );
    return res as unknown as BookingCouponResponse;
  },

  delete: async (code: string): Promise<BookingCouponResponse> => {
    const res = await apiClient.delete<BookingCoupon>(
      `/booking-coupons/${encodeURIComponent(code)}`
    );
    return res as unknown as BookingCouponResponse;
  },
};
