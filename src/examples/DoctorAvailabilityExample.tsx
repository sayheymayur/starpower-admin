import React, { useState } from 'react';
import DoctorStatusDashboard from '../components/DoctorStatusDashboard';
import DoctorStatusWidget from '../components/DoctorStatusWidget';
import QuickStatusUpdate from '../components/QuickStatusUpdate';
import DoctorSearch from '../components/DoctorSearch';

const DoctorAvailabilityExample: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [showCompact, setShowCompact] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Doctor Availability Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive dashboard for managing doctor availability status
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard Controls
            </h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCompact}
                  onChange={(e) => setShowCompact(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Compact View</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <DoctorStatusDashboard
          refreshInterval={30000}
          showQuickActions={true}
          compact={showCompact}
        />

        {/* Search and Individual Doctor Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Search */}
          <DoctorSearch
            onDoctorSelect={(doctor) => {
              setSelectedDoctor(doctor.userId);
              setSelectedPhone(null);
            }}
            compact={showCompact}
          />

          {/* Individual Doctor Status Widget */}
          <DoctorStatusWidget
            doctorId={selectedDoctor || undefined}
            phoneNumber={selectedPhone || undefined}
            onStatusUpdate={(newStatus) => {
              console.log('Doctor status updated to:', newStatus);
            }}
            showHistory={true}
            compact={showCompact}
          />
        </div>

        {/* Quick Status Update */}
        <QuickStatusUpdate
          onUpdate={(result) => {
            console.log('Bulk update result:', result);
          }}
          compact={showCompact}
        />

        {/* Additional Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Compact Dashboard */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compact Dashboard
            </h3>
            <DoctorStatusDashboard
              refreshInterval={60000}
              showQuickActions={false}
              compact={true}
            />
          </div>

          {/* Compact Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compact Search
            </h3>
            <DoctorSearch
              placeholder="Search doctors..."
              compact={true}
            />
          </div>

          {/* Compact Quick Update */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compact Quick Update
            </h3>
            <QuickStatusUpdate
              compact={true}
            />
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-6">
            {/* Code Examples */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Basic Usage
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { DoctorStatusDashboard } from './components/DoctorStatusDashboard';

function MyDashboard() {
  return (
    <DoctorStatusDashboard
      refreshInterval={30000}
      showQuickActions={true}
      compact={false}
    />
  );
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Individual Doctor Management
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { DoctorStatusWidget } from './components/DoctorStatusWidget';

function DoctorManagement() {
  return (
    <DoctorStatusWidget
      doctorId={123}
      onStatusUpdate={(newStatus) => {
        console.log('Status updated to:', newStatus);
      }}
      showHistory={true}
    />
  );
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Bulk Status Updates
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { QuickStatusUpdate } from './components/QuickStatusUpdate';

function BulkUpdate() {
  return (
    <QuickStatusUpdate
      onUpdate={(result) => {
        console.log('Bulk update completed:', result);
      }}
    />
  );
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Doctor Search
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { DoctorSearch } from './components/DoctorSearch';

function SearchDoctors() {
  return (
    <DoctorSearch
      onDoctorSelect={(doctor) => {
        console.log('Selected doctor:', doctor);
      }}
      placeholder="Search by ID or phone"
    />
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            API Integration Examples
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Update Doctor Status
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { doctorAvailabilityAPI } from '../services/api';

// Update by User ID
await doctorAvailabilityAPI.updateStatusByUserId(123, {
  avail_status: 1, // Available
  created_by: 1
});

// Update by Phone Number
await doctorAvailabilityAPI.updateStatusByPhone('+1234567890', {
  avail_status: 0, // Unavailable
  created_by: 1
});`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Get Doctor Status
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`// Get status by User ID
const status = await doctorAvailabilityAPI.getStatusByUserId(123);

// Get status by Phone Number
const status = await doctorAvailabilityAPI.getStatusByPhone('+1234567890');

// Get availability statistics
const stats = await doctorAvailabilityAPI.getStatistics();`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Bulk Operations
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`// Bulk update multiple doctors
const result = await doctorAvailabilityAPI.bulkUpdateStatus({
  userIds: [123, 456, 789],
  phoneNumbers: ['+1234567890', '+0987654321'],
  avail_status: 1, // Available
  created_by: 1
});

console.log('Successful:', result.successful.length);
console.log('Failed:', result.failed.length);`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Status Values Reference */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Status Values Reference
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="text-lg font-semibold text-red-800 dark:text-red-200">0 - Unavailable</div>
              <div className="text-sm text-red-600 dark:text-red-400">Doctor is not available for sessions</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-lg font-semibold text-green-800 dark:text-green-200">1 - Available</div>
              <div className="text-sm text-green-600 dark:text-green-400">Doctor is available for sessions</div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <div className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">2 - Busy</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Doctor is currently busy</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">3 - On Break</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Doctor is on a break</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityExample;
