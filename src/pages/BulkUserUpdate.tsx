import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardAPI from "../services/dashboardAPI";
import useGoBack from "../hooks/useGoBack";

interface BulkUpdateItem {
  userId?: number;
  phoneNumber?: string;
  updateData: {
    [key: string]: any;
  };
}

export default function BulkUserUpdate() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdateItem[]>([
    { updateData: {} }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const addBulkUpdateRow = () => {
    setBulkUpdates([...bulkUpdates, { updateData: {} }]);
  };

  const removeBulkUpdateRow = (index: number) => {
    setBulkUpdates(bulkUpdates.filter((_, i) => i !== index));
  };

  const updateBulkUpdateRow = (index: number, field: keyof BulkUpdateItem, value: any) => {
    const updated = [...bulkUpdates];
    updated[index] = { ...updated[index], [field]: value };
    setBulkUpdates(updated);
  };

  const updateBulkUpdateData = (index: number, field: string, value: any) => {
    const updated = [...bulkUpdates];
    updated[index] = {
      ...updated[index],
      updateData: {
        ...updated[index].updateData,
        [field]: value
      }
    };
    setBulkUpdates(updated);
  };

  const handleBulkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setResults(null);

      // Validate bulk updates
      const validUpdates = bulkUpdates.filter(update => 
        (update.userId && update.userId > 0) || (update.phoneNumber && update.phoneNumber.trim() !== '')
      );

      if (validUpdates.length === 0) {
        throw new Error('Please provide at least one valid update with User ID or Phone Number');
      }

      // Separate updates by identification method
      const userIds: number[] = [];
      const phoneNumbers: string[] = [];
      const updateData = validUpdates[0].updateData; // Use first update's data as template

      validUpdates.forEach(update => {
        if (update.userId) {
          userIds.push(update.userId);
        }
        if (update.phoneNumber) {
          phoneNumbers.push(update.phoneNumber);
        }
      });

      const response = await dashboardAPI.bulkUpdateUsers({
        userIds: userIds.length > 0 ? userIds : undefined,
        phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
        updateData
      });

      if (response.success) {
        setSuccess(`Bulk update completed: ${response.data.successCount} successful, ${response.data.errorCount} failed`);
        setResults(response.data);
      } else {
        throw new Error(response.message || 'Failed to perform bulk update');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error performing bulk update:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: number) => {
    switch (status) {
      case 0: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const getDoctorProfileStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: 'Pending review',
      3: 'Pending verification',
      1: 'Verified',
      4: 'Verified',
      2: 'Rejected',
    };
    return statusMap[status] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk User Update</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update multiple users simultaneously
          </p>
        </div>
        <button
          onClick={goBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Back to Users
        </button>
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

      {/* Bulk Update Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Update Configuration</h2>
        
        <form onSubmit={handleBulkUpdate} className="space-y-6">
          {/* Bulk Update Rows */}
          <div className="space-y-4">
            {bulkUpdates.map((update, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={update.userId || ''}
                    onChange={(e) => updateBulkUpdateRow(index, 'userId', Number(e.target.value))}
                    placeholder="Enter User ID"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                    value={update.phoneNumber || ''}
                    onChange={(e) => updateBulkUpdateRow(index, 'phoneNumber', e.target.value)}
                    placeholder="Enter Phone Number"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBulkUpdateRow(index)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                  disabled={bulkUpdates.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addBulkUpdateRow}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            + Add Another User
          </button>

          {/* Update Fields */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fields to Update</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.full_name || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'full_name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.email_id || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'email_id', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.mobile_no || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'mobile_no', e.target.value)}
                />
              </div>

              {/* Status Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.status || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'status', Number(e.target.value))}
                >
                  <option value="">Select Status</option>
                  <option value={0}>Inactive</option>
                  <option value={1}>Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Is Doctor
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.is_doctor || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'is_doctor', Number(e.target.value))}
                >
                  <option value="">Select</option>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  KYC Status
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.kyc_status || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'kyc_status', Number(e.target.value))}
                >
                  <option value="">Select KYC Status</option>
                  <option value={0}>Not submitted</option>
                  <option value={1}>Submitted</option>
                  <option value={2}>Verified</option>
                  <option value={3}>Rejected</option>
                </select>
              </div>

              {/* Professional Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Doctor Profile Status
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.doctor_profile_status || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'doctor_profile_status', Number(e.target.value))}
                >
                  <option value="">Select Profile Status</option>
                  <option value={0}>Pending</option>
                  <option value={1}>Approved</option>
                  <option value={2}>Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Per Minute Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.per_minute_cost || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'per_minute_cost', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Commission Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.commission_per || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'commission_per', Number(e.target.value))}
                />
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Language
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.prefered_language || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'prefered_language', e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  App Platform
                </label>
                <select
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.app_platform || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'app_platform', e.target.value)}
                >
                  <option value="">Select Platform</option>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="web">Web</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State ID
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                  value={bulkUpdates[0]?.updateData.state_id_fk || ''}
                  onChange={(e) => updateBulkUpdateData(0, 'state_id_fk', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setBulkUpdates([{ updateData: {} }]);
                setError(null);
                setSuccess(null);
                setResults(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Execute Bulk Update'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Processed</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{results.totalProcessed}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{results.successCount}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">{results.errorCount}</p>
            </div>
          </div>

          {/* Successful Updates */}
          {results.successful && results.successful.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Successful Updates</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">User ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">KYC Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Doctor Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.successful.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.userId}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(item.data?.status)}`}>
                            {item.data?.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {getKycStatusText(item.data?.kyc_status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {getDoctorProfileStatusText(item.data?.doctor_profile_status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Failed Updates */}
          {results.failed && results.failed.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Failed Updates</h3>
              <div className="space-y-2">
                {results.failed.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>User ID:</strong> {item.userId} - <strong>Error:</strong> {item.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
