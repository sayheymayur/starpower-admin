/** OTP monitor — endpoint sub-scopes + legacy module scope. */
export const OTP_GETOTPS_READ = 'otp.monitor.getotps:read';
export const OTP_OTPLOG_READ = 'otp.monitor.otplog:read';
export const OTP_MONITOR_READ_LEGACY = 'otp.monitor:read';

/** Any of these grants access to the Login OTP monitor page / history fetch. */
export const OTP_PAGE_READ_SCOPES = [
  OTP_GETOTPS_READ,
  OTP_MONITOR_READ_LEGACY,
] as const;

/** Live OTP push (otplog events). */
export const OTP_LIVE_SCOPES = [OTP_OTPLOG_READ, OTP_MONITOR_READ_LEGACY] as const;
