# Dashboard APIs - Complete Implementation

This directory contains a comprehensive implementation of all Dashboard APIs as specified in the API documentation. The implementation includes TypeScript interfaces, API clients, React hooks, and usage examples.

## 📁 Structure

```
src/services/api/
├── config.ts              # API configuration and endpoints
├── base.ts                # Base API client with error handling
├── userData.ts            # User Data APIs
├── userUpdate.ts          # User Update APIs
├── sessions.ts            # Session Management APIs
├── wallet.ts              # Wallet and Financial APIs
├── doctorAvailability.ts  # Doctor Availability APIs
├── activity.ts            # Activity Tracking APIs
├── posts.ts               # Posts and Content APIs
├── notifications.ts       # Notifications and FCM APIs
├── analytics.ts           # Analytics and Reporting APIs
├── index.ts               # Main export file
└── README.md              # This documentation

src/hooks/
├── useApi.ts              # Generic API hooks
├── useUserData.ts         # User Data hooks
├── useSessions.ts         # Session hooks
├── useWallet.ts           # Wallet hooks
├── useAnalytics.ts        # Analytics hooks
└── ...

src/examples/
└── DashboardExample.tsx   # Complete usage example
```

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { userDataAPI, sessionsAPI, walletAPI } from '../services/api';

// Get all users
const users = await userDataAPI.getAllUsers({ page: 1, limit: 20 });

// Get session statistics
const stats = await sessionsAPI.getSessionStats();

// Get wallet transactions
const transactions = await walletAPI.getTransactions({ limit: 50 });
```

### 2. Using React Hooks

```typescript
import { useUsers, useSessions, useWalletStats } from '../hooks/useUserData';

function Dashboard() {
  const { data: users, loading, error } = useUsers({ limit: 20 });
  const { data: sessions } = useSessions({ status: 'active' });
  const { data: walletStats } = useWalletStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users: {users?.users.length}</h1>
      <h2>Active Sessions: {sessions?.sessions.length}</h2>
      <h3>Total Revenue: ₹{walletStats?.totalRevenue}</h3>
    </div>
  );
}
```

## 📚 API Categories

### 1. User Data APIs (`userDataAPI`)

**Endpoints:**
- `getAllUsers()` - Get all users with pagination
- `getAllListeners()` - Get all doctors/listeners
- `getStats()` - Get user statistics
- `getUserById(id)` - Get user by ID
- `searchUsers(query)` - Search users by name/email/mobile

**React Hooks:**
```typescript
import { useUsers, useUserStats, useUserSearch } from '../hooks/useUserData';

const { data: users, loading, pagination } = useUsers({ limit: 20 });
const { data: stats } = useUserStats();
const { search, results } = useUserSearch();
```

### 2. User Update APIs (`userUpdateAPI`)

**Endpoints:**
- `updateUserById(id, updates)` - Update user by ID
- `updateUserStatus(id, status)` - Update user status
- `updateUserKycStatus(id, status)` - Update KYC status
- `bulkUpdateUsers(request)` - Bulk update multiple users

**Example:**
```typescript
import { userUpdateAPI } from '../services/api';

// Update user status
await userUpdateAPI.updateUserStatus(123, { status: 1, reason: 'Activated by admin' });

// Update multiple fields
await userUpdateAPI.updateUserById(123, {
  full_name: 'John Doe',
  email_id: 'john@example.com',
  status: 1
});
```

### 3. Session APIs (`sessionsAPI`)

**Endpoints:**
- `getAllSessions()` - Get all sessions with pagination
- `getSessionsByUser(userId)` - Get sessions by user
- `getActiveSessions()` - Get active sessions
- `getSessionDetails(sessionId)` - Get detailed session info
- `getSessionStats()` - Get session statistics

**React Hooks:**
```typescript
import { useSessions, useActiveSessions, useSessionStats } from '../hooks/useSessions';

const { data: sessions, pagination } = useSessions({ limit: 20 });
const { data: activeSessions } = useActiveSessions();
const { data: stats } = useSessionStats();
```

### 4. Wallet APIs (`walletAPI`)

**Endpoints:**
- `getTransactions()` - Get wallet transactions
- `getUserTransactions(userId)` - Get user transactions
- `getWalletStats()` - Get wallet statistics
- `getUserBalance(userId)` - Get user balance
- `getTopUsersByVolume()` - Get top users by transaction volume

**React Hooks:**
```typescript
import { useWalletTransactions, useWalletStats, useUserBalance } from '../hooks/useWallet';

const { data: transactions } = useWalletTransactions({ limit: 50 });
const { data: stats } = useWalletStats();
const { data: balance } = useUserBalance(123);
```

### 5. Doctor Availability APIs (`doctorAvailabilityAPI`)

**Endpoints:**
- `getAllAvailability()` - Get all availability records
- `getAvailabilityByDoctor(doctorId)` - Get doctor availability
- `getCurrentAvailability()` - Get current availability
- `createAvailability(request)` - Create availability record
- `updateAvailability(id, updates)` - Update availability

**Example:**
```typescript
import { doctorAvailabilityAPI } from '../services/api';

// Get available doctors now
const available = await doctorAvailabilityAPI.getAvailableDoctorsNow();

// Create availability record
await doctorAvailabilityAPI.createAvailability({
  doctor_id: 123,
  status: 1,
  start_time: '2024-01-01T09:00:00Z',
  end_time: '2024-01-01T17:00:00Z'
});
```

### 6. Activity APIs (`activityAPI`)

**Endpoints:**
- `getLatestActivities()` - Get latest activities
- `getActivitiesByUser(userId)` - Get user activities
- `getActivityStats()` - Get activity statistics
- `trackUserActivity(userId, type, description)` - Track activity

**Example:**
```typescript
import { activityAPI } from '../services/api';

// Track user login
await activityAPI.trackUserActivity(123, 'login', 'User logged in successfully');

// Get user activity timeline
const timeline = await activityAPI.getUserActivityTimeline(123, 30);
```

### 7. Posts APIs (`postsAPI`)

**Endpoints:**
- `getAllPosts()` - Get all posts with pagination
- `getPostsByUser(userId)` - Get user posts
- `getPostStats()` - Get post statistics
- `getMostLikedPosts()` - Get most liked posts

**React Hooks:**
```typescript
import { usePosts, usePostStats, useMostLikedPosts } from '../hooks/usePosts';

const { data: posts } = usePosts({ limit: 20 });
const { data: stats } = usePostStats();
const { data: likedPosts } = useMostLikedPosts(10);
```

### 8. Notifications APIs (`notificationsAPI`)

**Endpoints:**
- `getAllNotifications()` - Get all notifications
- `sendNotification(request)` - Send notification
- `sendGlobalNotification(request)` - Send global notification
- `getNotificationStats()` - Get notification statistics

**Example:**
```typescript
import { notificationsAPI } from '../services/api';

// Send notification to specific users
await notificationsAPI.sendNotificationToUsers(
  [123, 456, 789],
  'New Feature Available',
  'Check out our latest update!',
  'feature_update'
);

// Send global notification
await notificationsAPI.sendGlobalNotification({
  title: 'System Maintenance',
  message: 'Scheduled maintenance tonight at 2 AM',
  type: 'maintenance'
});
```

### 9. Analytics APIs (`analyticsAPI`)

**Endpoints:**
- `getDashboardAnalytics()` - Get comprehensive dashboard data
- `getUserAnalytics()` - Get user analytics
- `getFinancialAnalytics()` - Get financial analytics
- `getGrowthMetrics()` - Get growth metrics
- `getKPIs()` - Get key performance indicators

**React Hooks:**
```typescript
import { useDashboardAnalytics, useKPIs, useRealTimeMetrics } from '../hooks/useAnalytics';

const { data: dashboard } = useDashboardAnalytics();
const { data: kpis } = useKPIs();
const { data: realTime } = useRealTimeMetrics();
```

## 🔧 Advanced Features

### 1. Pagination

All list endpoints support pagination:

```typescript
const { data, pagination, nextPage, prevPage, goToPage } = useUsers({
  page: 1,
  limit: 20
});

// Navigate pages
await nextPage();
await prevPage();
await goToPage(5);
```

### 2. Search

Many endpoints support search functionality:

```typescript
const { search, results, loading } = useUserSearch();

// Search users
search('john doe');
```

### 3. Real-time Data

Some hooks support real-time updates:

```typescript
const { data: activeSessions } = useActiveSessionsRealtime(10000); // Update every 10 seconds
const { data: realTimeMetrics } = useDashboardRealtime(30000); // Update every 30 seconds
```

### 4. Error Handling

All hooks include comprehensive error handling:

```typescript
const { data, loading, error, execute, reset } = useUsers();

if (error) {
  console.error('API Error:', error.message);
  console.error('Status:', error.status);
  console.error('Response:', error.response);
}

// Retry on error
if (error) {
  await execute();
}
```

### 5. Custom Hooks

You can create custom hooks for specific use cases:

```typescript
function useUserDashboard(userId: number) {
  const { data: user } = useUser(userId);
  const { data: sessions } = useSessionsByUser(userId);
  const { data: transactions } = useUserTransactions(userId);
  const { data: balance } = useUserBalance(userId);

  return {
    user,
    sessions,
    transactions,
    balance,
    loading: !user || !sessions || !transactions || !balance
  };
}
```

## 🛠️ Configuration

### API Base URL

Update the base URL in `config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com/api/dashboard/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};
```

### Authentication

The API client automatically includes authentication headers:

```typescript
// Token is automatically added from localStorage
const token = localStorage.getItem('authToken');
```

### Error Handling

Customize error handling in `base.ts`:

```typescript
// Add custom error handling
apiClient.request = async (endpoint, options) => {
  try {
    return await originalRequest(endpoint, options);
  } catch (error) {
    // Custom error handling
    if (error.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    throw error;
  }
};
```

## 📊 Complete Example

See `src/examples/DashboardExample.tsx` for a complete implementation showing:

- Real-time metrics display
- Paginated data tables
- Error handling
- Loading states
- Search functionality
- Multiple API integrations

## 🔍 TypeScript Support

All APIs are fully typed with TypeScript interfaces:

```typescript
import type { User, Session, WalletTransaction } from '../services/api';

function processUser(user: User) {
  console.log(user.full_name || 'Anonymous');
  console.log(user.user_id_pk);
}
```

## 🚨 Error Handling

The API client includes:

- Automatic retries for transient errors
- Request timeouts
- Comprehensive error types
- Error logging and reporting

```typescript
try {
  const users = await userDataAPI.getAllUsers();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
  }
}
```

## 📈 Performance

- Automatic request deduplication
- Built-in caching strategies
- Optimized pagination
- Real-time updates with configurable intervals
- Debounced search

## 🔒 Security

- Automatic authentication header injection
- Request/response validation
- CSRF protection
- Input sanitization

This implementation provides a complete, production-ready API client for the SayHey Dashboard with full TypeScript support, React integration, and comprehensive error handling.
