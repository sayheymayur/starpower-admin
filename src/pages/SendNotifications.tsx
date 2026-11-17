import { useState } from "react";
import dashboardAPI from "../services/dashboardAPI";
import { UserIcon, CalenderIcon, EnvelopeIcon, GroupIcon } from "../icons";

interface NotificationForm {
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: string;
  log: boolean;
}

interface BulkNotificationForm extends NotificationForm {
  userIds: string;
}

interface AllUsersNotificationForm extends NotificationForm {
  userType: 'all' | 'doctors' | 'users' | 'listeners';
}

interface ScheduledNotificationForm extends NotificationForm {
  scheduleFor: string;
}

interface FCMTokenNotificationForm {
  fcmToken: string;
  title: string;
  body: string;
  data: string;
  imageUrl: string;
}

export default function SendNotifications() {
  const [activeTab, setActiveTab] = useState<'user' | 'phone' | 'bulk' | 'all' | 'schedule' | 'fcm-token'>('user');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [userForm, setUserForm] = useState<NotificationForm & { userId: string }>({
    userId: '',
    title: '',
    body: '',
    priority: 'normal',
    metadata: '',
    log: true,
  });

  const [phoneForm, setPhoneForm] = useState<NotificationForm & { phoneNumber: string }>({
    phoneNumber: '',
    title: '',
    body: '',
    priority: 'normal',
    metadata: '',
    log: true,
  });

  const [bulkForm, setBulkForm] = useState<BulkNotificationForm>({
    userIds: '',
    title: '',
    body: '',
    priority: 'normal',
    metadata: '',
    log: true,
  });

  const [allUsersForm, setAllUsersForm] = useState<AllUsersNotificationForm>({
    title: '',
    body: '',
    priority: 'normal',
    userType: 'all',
    metadata: '',
    log: true,
  });

  const [scheduleForm, setScheduleForm] = useState<ScheduledNotificationForm & { userId: string }>({
    userId: '',
    title: '',
    body: '',
    priority: 'normal',
    metadata: '',
    log: true,
    scheduleFor: '',
  });

  const [fcmTokenForm, setFcmTokenForm] = useState<FCMTokenNotificationForm>({
    fcmToken: '',
    title: '',
    body: '',
    data: '',
    imageUrl: '',
  });

  const handleSendToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const metadata = userForm.metadata ? JSON.parse(userForm.metadata) : {};
      
      const response = await dashboardAPI.sendNotificationToUser(Number(userForm.userId), {
        title: userForm.title,
        body: userForm.body,
        priority: userForm.priority,
        metadata,
        log: userForm.log,
      });

      if (response.success) {
        setSuccess(`Notification sent successfully to user ${userForm.userId}`);
        setUserForm(prev => ({ ...prev, title: '', body: '', metadata: '' }));
      } else {
        throw new Error(response.message || 'Failed to send notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const metadata = phoneForm.metadata ? JSON.parse(phoneForm.metadata) : {};
      
      const response = await dashboardAPI.sendNotificationToPhone(phoneForm.phoneNumber, {
        title: phoneForm.title,
        body: phoneForm.body,
        priority: phoneForm.priority,
        metadata,
        log: phoneForm.log,
      });

      if (response.success) {
        setSuccess(`Notification sent successfully to phone ${phoneForm.phoneNumber}`);
        setPhoneForm(prev => ({ ...prev, title: '', body: '', metadata: '' }));
      } else {
        throw new Error(response.message || 'Failed to send notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const userIds = bulkForm.userIds.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
      const metadata = bulkForm.metadata ? JSON.parse(bulkForm.metadata) : {};
      
      const response = await dashboardAPI.sendBulkNotifications({
        userIds,
        title: bulkForm.title,
        body: bulkForm.body,
        priority: bulkForm.priority,
        metadata,
        log: bulkForm.log,
      });

      if (response.success) {
        setSuccess(`Bulk notification sent successfully to ${userIds.length} users`);
        setBulkForm(prev => ({ ...prev, title: '', body: '', metadata: '', userIds: '' }));
      } else {
        throw new Error(response.message || 'Failed to send bulk notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending bulk notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const metadata = allUsersForm.metadata ? JSON.parse(allUsersForm.metadata) : {};
      
      const response = await dashboardAPI.sendNotificationToAll({
        title: allUsersForm.title,
        body: allUsersForm.body,
        priority: allUsersForm.priority,
        userType: allUsersForm.userType,
        metadata,
        log: allUsersForm.log,
      });

      if (response.success) {
        setSuccess(`Notification sent successfully to all ${allUsersForm.userType} users`);
        setAllUsersForm(prev => ({ ...prev, title: '', body: '', metadata: '' }));
      } else {
        throw new Error(response.message || 'Failed to send notification to all users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending notification to all users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const metadata = scheduleForm.metadata ? JSON.parse(scheduleForm.metadata) : {};
      
      const response = await dashboardAPI.scheduleNotificationForUser(Number(scheduleForm.userId), {
        title: scheduleForm.title,
        body: scheduleForm.body,
        priority: scheduleForm.priority,
        metadata,
        scheduleFor: scheduleForm.scheduleFor,
      });

      if (response.success) {
        setSuccess(`Notification scheduled successfully for user ${scheduleForm.userId}`);
        setScheduleForm(prev => ({ ...prev, title: '', body: '', metadata: '', scheduleFor: '' }));
      } else {
        throw new Error(response.message || 'Failed to schedule notification');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error scheduling notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToFCMToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = fcmTokenForm.data ? JSON.parse(fcmTokenForm.data) : undefined;
      
      const response = await dashboardAPI.sendNotificationToToken({
        fcmToken: fcmTokenForm.fcmToken,
        title: fcmTokenForm.title,
        body: fcmTokenForm.body,
        data,
        imageUrl: fcmTokenForm.imageUrl || undefined,
      });

      if (response.success) {
        setSuccess(`Notification sent successfully to FCM token${response.data?.messageId ? ` (Message ID: ${response.data.messageId})` : ''}`);
        setFcmTokenForm({
          fcmToken: '',
          title: '',
          body: '',
          data: '',
          imageUrl: '',
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to send notification');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage.includes('invalid-registration-token') || errorMessage.includes('registration-token-not-registered')
        ? 'Invalid or expired FCM token. Please check the token and try again.'
        : errorMessage);
      console.error('Error sending notification to FCM token:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'user', label: 'Send to User', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'phone', label: 'Send to Phone', icon: <EnvelopeIcon className="w-4 h-4" /> },
    { id: 'bulk', label: 'Bulk Send', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'all', label: 'Send to All', icon: <GroupIcon className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <CalenderIcon className="w-4 h-4" /> },
    { id: 'fcm-token', label: 'Send to FCM Token', icon: <EnvelopeIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Notifications</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Send notifications to users, schedule them, or send bulk notifications
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Send to User */}
          {activeTab === 'user' && (
            <form onSubmit={handleSendToUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={userForm.userId}
                  onChange={(e) => setUserForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={userForm.title}
                  onChange={(e) => setUserForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={userForm.body}
                  onChange={(e) => setUserForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification message"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={userForm.priority}
                    onChange={(e) => setUserForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata (JSON)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={userForm.metadata}
                    onChange={(e) => setUserForm(prev => ({ ...prev, metadata: e.target.value }))}
                    placeholder='{"type": "admin_sent"}'
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          )}

          {/* Send to Phone */}
          {activeTab === 'phone' && (
            <form onSubmit={handleSendToPhone} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={phoneForm.phoneNumber}
                  onChange={(e) => setPhoneForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={phoneForm.title}
                  onChange={(e) => setPhoneForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={phoneForm.body}
                  onChange={(e) => setPhoneForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification message"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={phoneForm.priority}
                    onChange={(e) => setPhoneForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata (JSON)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={phoneForm.metadata}
                    onChange={(e) => setPhoneForm(prev => ({ ...prev, metadata: e.target.value }))}
                    placeholder='{"type": "admin_sent"}'
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          )}

          {/* Bulk Send */}
          {activeTab === 'bulk' && (
            <form onSubmit={handleSendBulk} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User IDs (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkForm.userIds}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, userIds: e.target.value }))}
                  placeholder="123, 456, 789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkForm.body}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification message"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={bulkForm.priority}
                    onChange={(e) => setBulkForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata (JSON)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={bulkForm.metadata}
                    onChange={(e) => setBulkForm(prev => ({ ...prev, metadata: e.target.value }))}
                    placeholder='{"type": "bulk_notification"}'
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Bulk Notification'}
              </button>
            </form>
          )}

          {/* Send to All */}
          {activeTab === 'all' && (
            <form onSubmit={handleSendToAll} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Type
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={allUsersForm.userType}
                  onChange={(e) => setAllUsersForm(prev => ({ ...prev, userType: e.target.value as any }))}
                >
                  <option value="all">All Users</option>
                  <option value="doctors">Doctors Only</option>
                  <option value="users">Users Only</option>
                  <option value="listeners">Listeners Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={allUsersForm.title}
                  onChange={(e) => setAllUsersForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={allUsersForm.body}
                  onChange={(e) => setAllUsersForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification message"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={allUsersForm.priority}
                    onChange={(e) => setAllUsersForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata (JSON)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={allUsersForm.metadata}
                    onChange={(e) => setAllUsersForm(prev => ({ ...prev, metadata: e.target.value }))}
                    placeholder='{"type": "global_notification"}'
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send to All Users'}
              </button>
            </form>
          )}

          {/* Schedule Notification */}
          {activeTab === 'schedule' && (
            <form onSubmit={handleScheduleNotification} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={scheduleForm.userId}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule For
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={scheduleForm.scheduleFor}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduleFor: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={scheduleForm.body}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification message"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={scheduleForm.priority}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata (JSON)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={scheduleForm.metadata}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, metadata: e.target.value }))}
                    placeholder='{"type": "scheduled_notification"}'
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Notification'}
              </button>
            </form>
          )}

          {/* Send to FCM Token */}
          {activeTab === 'fcm-token' && (
            <form onSubmit={handleSendToFCMToken} className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Send notifications directly to a specific FCM token. This is useful for testing or sending to devices without user IDs.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FCM Token <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 font-mono text-xs"
                  value={fcmTokenForm.fcmToken}
                  onChange={(e) => setFcmTokenForm(prev => ({ ...prev, fcmToken: e.target.value }))}
                  placeholder="dKx8Y9zQ2Rw:APA91bH..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the FCM registration token of the target device
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={fcmTokenForm.title}
                  onChange={(e) => setFcmTokenForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={fcmTokenForm.body}
                  onChange={(e) => setFcmTokenForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Notification message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Payload (JSON - Optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 font-mono text-xs"
                  value={fcmTokenForm.data}
                  onChange={(e) => setFcmTokenForm(prev => ({ ...prev, data: e.target.value }))}
                  placeholder='{"type": "test", "action": "open_screen", "screenId": "123"}'
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Additional data to include with the notification (all values will be converted to strings)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={fcmTokenForm.imageUrl}
                  onChange={(e) => setFcmTokenForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  URL of image to display in the notification
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send to FCM Token'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
