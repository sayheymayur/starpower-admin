import { useState, useEffect } from "react";
import dashboardAPI from "../services/dashboardAPI";

interface UserUpdateFormProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
  onClose: () => void;
}

interface UpdateData {
  // Basic Information
  full_name?: string;
  email_id?: string;
  mobile_no?: string;
  bio?: string;
  profile_photo?: string;
  dob?: string;
  gender?: string;
  
  // Status and Settings
  status?: number;
  is_avatar?: boolean;
  is_brand_ambassador?: boolean;
  /** General test-account flag (DB column) — not Razorpay keys or test-astrologer visibility */
  test_user?: boolean;
  
  // Location
  latitude?: string;
  longitude?: string;
  state_id_fk?: number;
  
  // Professional Information
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
  
  // Preferences
  prefered_language?: string;
  app_platform?: string;
  device_id?: string;
  
  // KYC
  kyc_status?: number;
  
  // Contact
  fcm_token?: string;
}

export default function UserUpdateForm({ user, onUpdate, onClose }: UserUpdateFormProps) {
  const [formData, setFormData] = useState<UpdateData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Doctor Availability Status
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.fullName || '',
        email_id: user.emailId || '',
        mobile_no: user.mobileNo || '',
        bio: user.bio || '',
        profile_photo: user.profilePhoto || '',
        dob: user.dob || '',
        gender: user.gender || '',
        status: Number(user.status) || 0,
        is_avatar: user.isAvatar || false,
        is_brand_ambassador: user.isBrandAmbassador || false,
        test_user: Boolean(user.testUser ?? user.test_user),
        latitude: user.latitude || '',
        longitude: user.longitude || '',
        state_id_fk: Number(user.state?.stateId) || 0,
        is_doctor: Number(user.isDoctor) || 0,
        per_minute_cost: Number(user.perMinuteCost) || 0,
        commission_per: Number(user.commissionPer) || 0,
        chat_per_minute_cost: Number(user.chatPerMinuteCost) || 0,
        chat_commission_per: Number(user.chatCommissionPer) || 0,
        assessment_certi: user.assessmentCerti || '',
        qualification_proof: user.qualificationProof || '',
        doctor_profile_status: Number(user.doctorProfileStatus) || 0,
        pan_no: user.panNo || '',
        topic_ids: user.topicIds || '',
        prefered_language: user.preferedLanguage || '',
        app_platform: user.appPlatform || '',
        device_id: user.deviceId || '',
        kyc_status: Number(user.kycStatus) || 0,
        fcm_token: user.fcmToken || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!user?.userId) {
        throw new Error('User ID is not available');
      }

      // Filter out empty values and convert numeric fields
      const updateData = Object.fromEntries(
        Object.entries(formData)
          .filter(([_, value]) => 
            value !== '' && value !== null && value !== undefined
          )
          .map(([key, value]) => {
            // Convert numeric fields to numbers
            const numericFields = ['status', 'is_doctor', 'doctor_profile_status', 'per_minute_cost', 'commission_per', 'chat_per_minute_cost', 'chat_commission_per', 'state_id_fk', 'kyc_status', 'is_avatar', 'is_brand_ambassador', 'test_user'];
            if (numericFields.includes(key)) {
              return [key, Number(value)];
            }
            return [key, value];
          })
      );

      if (Object.keys(updateData).length === 0) {
        throw new Error('No changes to update');
      }
      const response = await dashboardAPI.updateUserByUserId(user.userId, updateData);

      if (response.success) {
        setSuccess('User updated successfully!');
        onUpdate(response.data);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await dashboardAPI.updateUserStatusByUserId(user.userId, {
        status,
        reason
      });

      if (response.success) {
        setSuccess(`User status updated to ${status === 1 ? 'Active' : 'Inactive'}`);
        onUpdate(response.data.updatedUser);
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating user status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycUpdate = async (kycStatus: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await dashboardAPI.updateUserKycByUserId(user.userId, {
        kyc_status: kycStatus,
        reason
      });

      if (response.success) {
        setSuccess(`KYC status updated to ${getKycStatusText(kycStatus)}`);
        onUpdate(response.data.updatedUser);
      } else {
        throw new Error(response.message || 'Failed to update KYC status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorAvailabilityUpdate = async (availStatus: number) => {
    try {
      setAvailabilityLoading(true);
      setError(null);
      setSuccess(null);

      const response = await dashboardAPI.updateDoctorAvailabilityStatusByUserId(user.userId, {
        avail_status: availStatus,
        created_by: 1 // Admin user ID
      });

      if (response.success) {
        setSuccess(`Doctor availability status updated to ${getAvailabilityStatusText(availStatus)}`);
      } else {
        throw new Error(response.message || 'Failed to update doctor availability status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating doctor availability status:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const getKycStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: 'Not submitted',
      1: 'Submitted',
      2: 'Verified',
      3: 'Rejected'
    };
    return statusMap[status] || 'Unknown';
  };

  const getAvailabilityStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: 'Unavailable',
      1: 'Available'
    };
    return statusMap[status] || 'Unknown';
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'professional', label: 'Professional', icon: '👨‍⚕️' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'status', label: 'Status & KYC', icon: '📋' },
    { id: 'availability', label: 'Availability', icon: '🕐' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Update User: {user?.full_name || 'Anonymous'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User ID: {user?.user_id_pk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-6 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.email_id || ''}
                    onChange={(e) => handleInputChange('email_id', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.mobile_no || ''}
                    onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.profile_photo || ''}
                    onChange={(e) => handleInputChange('profile_photo', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Professional Information Tab */}
            {activeTab === 'professional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Is Doctor
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.is_doctor || 0}
                    onChange={(e) => handleInputChange('is_doctor', Number(e.target.value))}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Doctor Profile Status
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.doctor_profile_status || 0}
                    onChange={(e) => handleInputChange('doctor_profile_status', Number(e.target.value))}
                  >
                    <option value={0}>Pending</option>
                    <option value={1}>Approved</option>
                    <option value={2}>Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Per Minute Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.per_minute_cost || ''}
                    onChange={(e) => handleInputChange('per_minute_cost', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.commission_per || ''}
                    onChange={(e) => handleInputChange('commission_per', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chat Per Minute Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.chat_per_minute_cost || ''}
                    onChange={(e) => handleInputChange('chat_per_minute_cost', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chat Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.chat_commission_per || ''}
                    onChange={(e) => handleInputChange('chat_commission_per', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.pan_no || ''}
                    onChange={(e) => handleInputChange('pan_no', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.topic_ids || ''}
                    onChange={(e) => handleInputChange('topic_ids', e.target.value)}
                    placeholder="1,2,3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assessment Certificate URL <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.assessment_certi || ''}
                    onChange={(e) => handleInputChange('assessment_certi', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Qualification Proof URL <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.qualification_proof || ''}
                    onChange={(e) => handleInputChange('qualification_proof', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.latitude || ''}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.longitude || ''}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.state_id_fk || ''}
                    onChange={(e) => handleInputChange('state_id_fk', Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Language
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.prefered_language || ''}
                    onChange={(e) => handleInputChange('prefered_language', e.target.value)}
                  >
                    <option value="">Select Language</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="bn">Bengali</option>
                    <option value="gu">Gujarati</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                    <option value="mr">Marathi</option>
                    <option value="pa">Punjabi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    App Platform
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.app_platform || ''}
                    onChange={(e) => handleInputChange('app_platform', e.target.value)}
                  >
                    <option value="">Select Platform</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="web">Web</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device ID
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.device_id || ''}
                    onChange={(e) => handleInputChange('device_id', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    FCM Token
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={formData.fcm_token || ''}
                    onChange={(e) => handleInputChange('fcm_token', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        checked={formData.is_avatar || false}
                        onChange={(e) => handleInputChange('is_avatar', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Is Avatar</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        checked={formData.is_brand_ambassador || false}
                        onChange={(e) => handleInputChange('is_brand_ambassador', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Is Brand Ambassador</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                        checked={formData.test_user || false}
                        onChange={(e) => handleInputChange('test_user', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Test user</span>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Test user is a general account flag. For Razorpay test keys use Razorpay test users; for hidden astrologers use the astro test profile setting.
                  </p>
                </div>
              </div>
            )}

            {/* Status & KYC Tab */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                {/* User Status */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Status</h3>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(1, 'Account activated by admin')}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Activate User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Enter reason for deactivation:');
                        if (reason) handleStatusUpdate(0, reason);
                      }}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Deactivate User
                    </button>
                  </div>
                </div>

                {/* KYC Status */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">KYC Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Enter reason:');
                        if (reason) handleKycUpdate(0, reason);
                      }}
                      disabled={loading}
                      className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Not Submitted
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Enter reason:');
                        if (reason) handleKycUpdate(1, reason);
                      }}
                      disabled={loading}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Submitted
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Enter reason:');
                        if (reason) handleKycUpdate(2, reason);
                      }}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Verified
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Enter reason:');
                        if (reason) handleKycUpdate(3, reason);
                      }}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Doctor Availability Tab */}
            {activeTab === 'availability' && user?.is_doctor === 1 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Doctor Availability Status</h3>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleDoctorAvailabilityUpdate(1)}
                      disabled={availabilityLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      {availabilityLoading ? 'Updating...' : 'Set Available'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDoctorAvailabilityUpdate(0)}
                      disabled={availabilityLoading}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      {availabilityLoading ? 'Updating...' : 'Set Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
