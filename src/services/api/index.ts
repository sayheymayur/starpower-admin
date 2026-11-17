// Export all API services
export { userDataAPI } from './userData';
export { userUpdateAPI } from './userUpdate';
export { sessionsAPI } from './sessions';
export { walletAPI } from './wallet';
export { doctorAvailabilityAPI } from './doctorAvailability';
export { activityAPI } from './activity';
export { postsAPI } from './posts';
export { notificationsAPI } from './notifications';
export { analyticsAPI } from './analytics';
export { appConfigAPI } from './appConfig';
export { bookingCouponsAPI } from './bookingCoupons';
export { bookingPricingAPI } from './bookingPricing';
export { razorpayTestUsersAPI } from './razorpayTestUsers';
export { astroAPI } from './astro';
export { astroWalletAPI } from './astroWallet';
export { listenerSupportAPI, astroSupportAPI } from './support';
export { callRecordingsAPI } from './callRecordings';
export { aadhaarAPI } from './aadhaar';
export { appLogsAPI } from './appLogs';
export { invoicesAPI, formatInvoiceINR } from './invoices';
export { ivrAPI, formatIvrPhone, formatIvrDuration, ivrOutcomeColor, ivrSourceLabel } from './ivr';

export { authService } from '../auth';
export type { AdminUser, AuthUser } from '../auth';

// Export base client and utilities
export { apiClient, ApiError } from './base';
export { API_CONFIG, API_ENDPOINTS } from './config';

// Export all types
export type {
  // User Data types
  User,
  State,
  UserStats,
  UserListParams,
} from './userData';

export type {
  // User Update types
  UpdateUserRequest,
  BulkUpdateRequest,
  FieldUpdateRequest,
  StatusUpdateRequest,
  CategoryUpdateRequest,
  StateUpdateRequest,
  ProfilePhotoUpdateRequest,
  EmailUpdateRequest,
  MobileUpdateRequest,
  FullNameUpdateRequest,
  UsernameUpdateRequest,
  BioUpdateRequest,
  AgeUpdateRequest,
  GenderUpdateRequest,
  ProfessionUpdateRequest,
  QualificationUpdateRequest,
  ExperienceUpdateRequest,
  SpecializationUpdateRequest,
  ConsultationFeeUpdateRequest,
  PerMinuteCostUpdateRequest,
  ChatPerMinuteCostUpdateRequest,
  CommissionPerUpdateRequest,
  ChatCommissionPerUpdateRequest,
  KycStatusUpdateRequest,
  DoctorProfileStatusUpdateRequest,
  AuditLogUpdateRequest,
} from './userUpdate';

export type {
  // Session types
  Session,
  User as SessionUser,
  Listener,
  State as SessionState,
  SessionStats,
  SessionDetails,
  ChatMessage,
  CallDetails,
  Rating,
  Transaction,
  SessionListParams,
  MissedSessionType,
  SessionDateField,
} from './sessions';

export type {
  // Wallet types
  WalletTransaction,
  WalletBalance,
  WalletStats,
  UserWalletStats,
  OverallWalletStats,
  TransactionListParams,
} from './wallet';

export type {
  // Doctor Availability types
  DoctorAvailabilityStatus,
  DoctorAvailability,
  AvailabilityStats,
  DoctorStatusUpdateRequest,
  BulkStatusUpdateRequest,
  DoctorStatusResponse,
  DoctorHistoryResponse,
  DoctorsByStatusResponse,
  BulkUpdateResponse,
  DoctorAvailabilityStats,
  AvailabilityHistory,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
  AvailabilityListParams,
} from './doctorAvailability';

export type {
  // Activity types
  ActivityType as Activity,
  ActivityStatsType as ActivityStats,
  UserActivityStatsType as UserActivityStats,
  CreateActivityRequestType as CreateActivityRequest,
  UpdateActivityRequestType as UpdateActivityRequest,
  ActivityListParamsType as ActivityListParams,
} from './activity';

export type {
  // Posts types
  PostType as Post,
  PostCommentType as PostComment,
  PostLikeType as PostLike,
  PostImageType as PostImage,
  PostReportType as PostReport,
  PostStatsType as PostStats,
  PostListParamsType as PostListParams,
} from './posts';

export type {
  // Notifications types
  Notification,
  FCMToken,
  NotificationStats,
  FCMStats,
  SendNotificationRequest,
  ScheduleNotificationRequest,
  SendGlobalNotificationRequest,
  NotificationListParams,
} from './notifications';

export type {
  // Analytics types
  DashboardAnalytics,
  UserAnalytics,
  FinancialAnalytics,
  GrowthMetrics,
} from './analytics';

export type {
  AppConfigValue,
  AppConfigData,
  AppConfigResponse,
  UserAppConfig,
  PartnerAppConfig,
} from './appConfig';

export type {
  BookingCoupon,
  BookingCouponPreview,
  BookingCouponPreviewMeta,
  BookingCouponListData,
  CreateBookingCouponInput,
  UpdateBookingCouponInput,
  ListBookingCouponsParams,
} from './bookingCoupons';

export type {
  BookingPricingConfig,
  BookingPricingData,
  BookingPricingSample,
} from './bookingPricing';

export type {
  RazorpayTestUsersConfig,
  RazorpayTestUsersListData,
  AddRazorpayTestUsersInput,
} from './razorpayTestUsers';

// Export common types
export type {
  PaginationParams,
  DateRangeParams,
  SearchParams,
  ApiResponse,
} from './config';

export type {
  AdminAadhaarProfile,
  AadhaarStats,
  AadhaarListParams,
  AadhaarVerificationStatus,
  AadhaarUpdateInput,
} from './aadhaar';

export type {
  AppLogEntry,
  AppLogStats,
  AppLogListParams,
  AppLogLevel,
} from './appLogs';

export type {
  AdminInvoiceItem,
  AdminInvoiceStats,
  AdminInvoiceMonth,
  AdminInvoiceListParams,
  InvoiceSource,
  InvoiceScope,
} from './invoices';

export type {
  IvrCall,
  IvrStats,
  IvrOutcome,
  IvrCallType,
  IvrSource,
  IvrSourceFilter,
  TriggerIvrCallInput,
} from './ivr';
