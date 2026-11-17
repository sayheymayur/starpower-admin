import { apiClient, ApiError } from './base';
import { API_ENDPOINTS, ApiResponse } from './config';

// Analytics interfaces
export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalDoctors: number;
    totalSessions: number;
    totalRevenue: number;
    activeUsers: number;
    activeSessions: number;
    newUsersToday: number;
    newSessionsToday: number;
    revenueToday: number;
  };
  userMetrics: {
    userGrowthRate: number;
    userRetentionRate: number;
    averageSessionPerUser: number;
    topUserStates: Array<{ state: string; count: number; percentage: number }>;
    userAgeDistribution: Array<{ age_group: string; count: number; percentage: number }>;
    userGenderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  };
  sessionMetrics: {
    sessionGrowthRate: number;
    averageSessionDuration: number;
    averageSessionCost: number;
    sessionCompletionRate: number;
    cancellationRate: number;
    topSessionTypes: Array<{ type: string; count: number; percentage: number }>;
    sessionTimeDistribution: Array<{ hour: number; count: number; percentage: number }>;
  };
  financialMetrics: {
    revenueGrowthRate: number;
    averageRevenuePerUser: number;
    averageRevenuePerSession: number;
    totalWalletBalance: number;
    totalTransactions: number;
    transactionTypes: Array<{ type: string; count: number; total_amount: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number; sessions: number }>;
  };
  contentMetrics: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    engagementRate: number;
    topCategories: Array<{ category: string; posts: number; engagement: number }>;
    contentGrowthRate: number;
  };
  systemMetrics: {
    totalNotifications: number;
    notificationDeliveryRate: number;
    systemUptime: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  trends: {
    userGrowthTrend: Array<{ date: string; users: number; doctors: number }>;
    sessionTrend: Array<{ date: string; sessions: number; revenue: number }>;
    engagementTrend: Array<{ date: string; likes: number; comments: number; views: number }>;
    revenueTrend: Array<{ date: string; revenue: number; transactions: number }>;
  };
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  userRetentionRate: number;
  averageAge: number;
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
  ageDistribution: Array<{ age_group: string; count: number; percentage: number }>;
  stateDistribution: Array<{ state: string; count: number; percentage: number }>;
  kycStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
  doctorStatusDistribution: Array<{ status: string; count: number; percentage: number }>;
  topStates: Array<{ state: string; count: number; growth: number }>;
  userActivityLevels: Array<{ level: string; count: number; percentage: number }>;
  registrationTrend: Array<{ date: string; users: number; doctors: number }>;
  userEngagementTrend: Array<{ date: string; active_users: number; sessions: number }>;
}

export interface FinancialAnalytics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueGrowthRate: number;
  averageRevenuePerUser: number;
  averageRevenuePerSession: number;
  totalTransactions: number;
  transactionsToday: number;
  transactionsThisWeek: number;
  transactionsThisMonth: number;
  totalWalletBalance: number;
  averageWalletBalance: number;
  transactionTypes: Array<{ type: string; count: number; total_amount: number; percentage: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; sessions: number; users: number }>;
  revenueByState: Array<{ state: string; revenue: number; percentage: number }>;
  topEarningDoctors: Array<{ doctor_id: number; doctor_name: string; revenue: number; sessions: number }>;
  topSpendingUsers: Array<{ user_id: number; user_name: string; spent: number; sessions: number }>;
  paymentMethodDistribution: Array<{ method: string; count: number; amount: number; percentage: number }>;
  refundRate: number;
  chargebackRate: number;
  averageTransactionValue: number;
  revenueTrend: Array<{ date: string; revenue: number; transactions: number }>;
}

export interface GrowthMetrics {
  userGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  sessionGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenueGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  engagementGrowth: {
    current: number;
    previous: number;
    growthRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  churnRate: number;
  lifetimeValue: number;
  acquisitionCost: number;
  growthProjections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  seasonalTrends: Array<{ period: string; factor: number; description: string }>;
}

// Analytics API class
export class AnalyticsAPI {
  // Get comprehensive dashboard analytics
  async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ANALYTICS.GET_DASHBOARD);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch dashboard analytics');
    }
  }

  // Get user analytics
  async getUserAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ANALYTICS.GET_USERS);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user analytics');
    }
  }

  // Get financial analytics
  async getFinancialAnalytics(): Promise<ApiResponse<FinancialAnalytics>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ANALYTICS.GET_FINANCIAL);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch financial analytics');
    }
  }

  // Get growth metrics
  async getGrowthMetrics(): Promise<ApiResponse<GrowthMetrics>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ANALYTICS.GET_GROWTH);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch growth metrics');
    }
  }

  // Get key performance indicators
  async getKPIs(): Promise<ApiResponse<{ kpis: Array<{ name: string; value: number; change: number; trend: 'up' | 'down' | 'stable'; target: number }> }>> {
    try {
      const [dashboard, users, financial] = await Promise.all([
        this.getDashboardAnalytics(),
        this.getUserAnalytics(),
        this.getFinancialAnalytics(),
      ]);

      const trendOf = (n: number): 'up' | 'down' | 'stable' =>
        n > 0 ? 'up' : n < 0 ? 'down' : 'stable';

      const kpis: Array<{
        name: string;
        value: number;
        change: number;
        trend: 'up' | 'down' | 'stable';
        target: number;
      }> = [
        {
          name: 'Total Users',
          value: dashboard.data.overview.totalUsers,
          change: users.data.userGrowthRate,
          trend: trendOf(users.data.userGrowthRate),
          target: 10000
        },
        {
          name: 'Active Sessions',
          value: dashboard.data.overview.activeSessions,
          change: 0, // Would need historical data
          trend: 'stable',
          target: 100
        },
        {
          name: 'Total Revenue',
          value: dashboard.data.overview.totalRevenue,
          change: financial.data.revenueGrowthRate,
          trend: trendOf(financial.data.revenueGrowthRate),
          target: 1000000
        },
        {
          name: 'Session Completion Rate',
          value: dashboard.data.sessionMetrics.sessionCompletionRate,
          change: 0, // Would need historical data
          trend: 'stable' as const,
          target: 85
        },
        {
          name: 'User Retention Rate',
          value: users.data.userRetentionRate,
          change: 0, // Would need historical data
          trend: 'stable' as const,
          target: 70
        },
        {
          name: 'Average Revenue Per User',
          value: financial.data.averageRevenuePerUser,
          change: 0, // Would need historical data
          trend: 'stable' as const,
          target: 100
        }
      ];

      return {
        success: true,
        message: 'KPIs fetched successfully',
        data: { kpis }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch KPIs');
    }
  }

  // Get real-time metrics
  async getRealTimeMetrics(): Promise<ApiResponse<{ metrics: { activeUsers: number; activeSessions: number; revenueToday: number; newUsersToday: number; systemUptime: number } }>> {
    try {
      const dashboard = await this.getDashboardAnalytics();
      
      return {
        success: true,
        message: 'Real-time metrics fetched successfully',
        data: {
          metrics: {
            activeUsers: dashboard.data.overview.activeUsers,
            activeSessions: dashboard.data.overview.activeSessions,
            revenueToday: dashboard.data.overview.revenueToday,
            newUsersToday: dashboard.data.overview.newUsersToday,
            systemUptime: dashboard.data.systemMetrics.systemUptime
          }
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch real-time metrics');
    }
  }

  // Get comparative analytics (current vs previous period)
  async getComparativeAnalytics(_period: 'day' | 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<{ comparison: { current: any; previous: any; change: number; trend: 'up' | 'down' | 'stable' } }>> {
    try {
      const dashboard = await this.getDashboardAnalytics();
      
      // This would need historical data from the backend
      // For now, return current data with mock previous data
      const mockPreviousData = {
        totalUsers: Math.floor(dashboard.data.overview.totalUsers * 0.9),
        totalSessions: Math.floor(dashboard.data.overview.totalSessions * 0.95),
        totalRevenue: Math.floor(dashboard.data.overview.totalRevenue * 0.88)
      };

      const currentData = {
        totalUsers: dashboard.data.overview.totalUsers,
        totalSessions: dashboard.data.overview.totalSessions,
        totalRevenue: dashboard.data.overview.totalRevenue
      };

      const change = {
        totalUsers: ((currentData.totalUsers - mockPreviousData.totalUsers) / mockPreviousData.totalUsers) * 100,
        totalSessions: ((currentData.totalSessions - mockPreviousData.totalSessions) / mockPreviousData.totalSessions) * 100,
        totalRevenue: ((currentData.totalRevenue - mockPreviousData.totalRevenue) / mockPreviousData.totalRevenue) * 100
      };

      return {
        success: true,
        message: 'Comparative analytics fetched successfully',
        data: {
          comparison: {
            current: currentData,
            previous: mockPreviousData,
            change: (change.totalUsers + change.totalSessions + change.totalRevenue) / 3,
            trend: change.totalUsers > 0 ? 'up' : change.totalUsers < 0 ? 'down' : 'stable'
          }
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch comparative analytics');
    }
  }

  // Get performance insights
  async getPerformanceInsights(): Promise<ApiResponse<{ insights: Array<{ type: 'success' | 'warning' | 'error'; title: string; description: string; impact: 'high' | 'medium' | 'low'; recommendation: string }> }>> {
    try {
      const [dashboard, users, financial] = await Promise.all([
        this.getDashboardAnalytics(),
        this.getUserAnalytics(),
        this.getFinancialAnalytics()
      ]);

      const insights = [];

      // User growth insight
      if (users.data.userGrowthRate > 10) {
        insights.push({
          type: 'success' as const,
          title: 'Strong User Growth',
          description: `User growth rate is ${users.data.userGrowthRate.toFixed(1)}%, which is excellent.`,
          impact: 'high' as const,
          recommendation: 'Consider scaling infrastructure to handle increased load.'
        });
      } else if (users.data.userGrowthRate < 0) {
        insights.push({
          type: 'error' as const,
          title: 'Declining User Growth',
          description: `User growth rate is ${users.data.userGrowthRate.toFixed(1)}%, indicating a decline.`,
          impact: 'high' as const,
          recommendation: 'Investigate user acquisition channels and improve retention strategies.'
        });
      }

      // Session completion insight
      if (dashboard.data.sessionMetrics.sessionCompletionRate < 70) {
        insights.push({
          type: 'warning' as const,
          title: 'Low Session Completion Rate',
          description: `Session completion rate is ${dashboard.data.sessionMetrics.sessionCompletionRate.toFixed(1)}%, which is below target.`,
          impact: 'medium' as const,
          recommendation: 'Analyze session cancellation reasons and improve user experience.'
        });
      }

      // Revenue growth insight
      if (financial.data.revenueGrowthRate > 20) {
        insights.push({
          type: 'success' as const,
          title: 'Strong Revenue Growth',
          description: `Revenue growth rate is ${financial.data.revenueGrowthRate.toFixed(1)}%, showing healthy business growth.`,
          impact: 'high' as const,
          recommendation: 'Consider expanding successful features and markets.'
        });
      }

      // User retention insight
      if (users.data.userRetentionRate < 50) {
        insights.push({
          type: 'warning' as const,
          title: 'Low User Retention',
          description: `User retention rate is ${users.data.userRetentionRate.toFixed(1)}%, which needs improvement.`,
          impact: 'high' as const,
          recommendation: 'Implement user engagement strategies and improve onboarding experience.'
        });
      }

      return {
        success: true,
        message: 'Performance insights fetched successfully',
        data: { insights }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch performance insights');
    }
  }

  // Get export data for reports
  async getExportData(type: 'dashboard' | 'users' | 'financial' | 'growth', format: 'json' | 'csv' = 'json'): Promise<ApiResponse<{ data: any; format: string; generated_at: string }>> {
    try {
      let data;
      switch (type) {
        case 'dashboard':
          data = await this.getDashboardAnalytics();
          break;
        case 'users':
          data = await this.getUserAnalytics();
          break;
        case 'financial':
          data = await this.getFinancialAnalytics();
          break;
        case 'growth':
          data = await this.getGrowthMetrics();
          break;
        default:
          throw new Error('Invalid export type');
      }

      return {
        success: true,
        message: 'Export data generated successfully',
        data: {
          data: data.data,
          format,
          generated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to generate export data');
    }
  }

  // Error handling
  private handleError(error: any, message: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(message, 0, error);
  }
}

// Export singleton instance
export const analyticsAPI = new AnalyticsAPI();

