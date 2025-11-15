"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type Period = "day" | "week" | "month" | "all";

interface UserMetrics {
  totalUsers: number;
  newSignups: number;
  activeUsers: number;
  returningUsers: number;
  usersWithResumes: number;
  usersWithNoProfile: number;
  signupsBreakdown: Array<{ date: string; count: number }>;
  period: string;
}

interface RevenueMetrics {
  credits: {
    totalPurchased: number;
    totalUsed: number;
    usageTrend: Array<{
      date: string;
      creditsUsed: number;
      creditsPurchased: number;
    }>;
  };
  revenue: {
    stripe: {
      total: number;
      daily: Array<{ date: string; amount: number }>;
      monthly: Array<{ month: string; amount: number }>;
    };
    failedPayments: number;
  };
  conversion: {
    signupsToGenerators: number;
    totalSignups: number;
    usersWhoGenerated: number;
  };
  period: string;
}

interface ResumeMetrics {
  totalResumes: number;
  averageGenerationTimeMinutes: number;
  qualityIssues: {
    missingHeader: number;
    missingExperience: number;
    missingEducation: number;
    missingSkills: number;
    emptyContent: number;
    totalChecked: number;
  };
  percentageMultipleResumes: number;
  mostCommonJobRoles: Array<{ role: string; count: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  period: string;
}

interface AnalyticsContextType {
  // User Metrics
  userMetrics: UserMetrics | null;
  userMetricsLoading: boolean;
  userMetricsError: string | null;
  fetchUserMetrics: (period?: Period) => Promise<void>;

  // Revenue Metrics
  revenueMetrics: RevenueMetrics | null;
  revenueMetricsLoading: boolean;
  revenueMetricsError: string | null;
  fetchRevenueMetrics: (period?: Period) => Promise<void>;

  // Resume Metrics
  resumeMetrics: ResumeMetrics | null;
  resumeMetricsLoading: boolean;
  resumeMetricsError: string | null;
  fetchResumeMetrics: (period?: Period) => Promise<void>;

  // Refresh all metrics
  refreshAllMetrics: (period?: Period) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [userMetricsLoading, setUserMetricsLoading] = useState(false);
  const [userMetricsError, setUserMetricsError] = useState<string | null>(null);

  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [revenueMetricsLoading, setRevenueMetricsLoading] = useState(false);
  const [revenueMetricsError, setRevenueMetricsError] = useState<string | null>(null);

  const [resumeMetrics, setResumeMetrics] = useState<ResumeMetrics | null>(null);
  const [resumeMetricsLoading, setResumeMetricsLoading] = useState(false);
  const [resumeMetricsError, setResumeMetricsError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchUserMetrics = useCallback(async (period: Period = "all") => {
    try {
      setUserMetricsLoading(true);
      setUserMetricsError(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/metrics/users?period=${period}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch user metrics" }));
        throw new Error(errorData.message || "Failed to fetch user metrics");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUserMetrics(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user metrics";
      setUserMetricsError(errorMessage);
      console.error("User metrics fetch error:", err);
    } finally {
      setUserMetricsLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchRevenueMetrics = useCallback(async (period: Period = "all") => {
    try {
      setRevenueMetricsLoading(true);
      setRevenueMetricsError(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/metrics/revenue?period=${period}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch revenue metrics" }));
        throw new Error(errorData.message || "Failed to fetch revenue metrics");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setRevenueMetrics(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch revenue metrics";
      setRevenueMetricsError(errorMessage);
      console.error("Revenue metrics fetch error:", err);
    } finally {
      setRevenueMetricsLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchResumeMetrics = useCallback(async (period: Period = "all") => {
    try {
      setResumeMetricsLoading(true);
      setResumeMetricsError(null);

      const response = await fetch(`${API_BASE_URL}/api/admin/metrics/resumes?period=${period}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch resume metrics" }));
        throw new Error(errorData.message || "Failed to fetch resume metrics");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setResumeMetrics(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch resume metrics";
      setResumeMetricsError(errorMessage);
      console.error("Resume metrics fetch error:", err);
    } finally {
      setResumeMetricsLoading(false);
    }
  }, [API_BASE_URL]);

  const refreshAllMetrics = useCallback(async (period: Period = "all") => {
    await Promise.all([
      fetchUserMetrics(period),
      fetchRevenueMetrics(period),
      fetchResumeMetrics(period),
    ]);
  }, [fetchUserMetrics, fetchRevenueMetrics, fetchResumeMetrics]);

  return (
    <AnalyticsContext.Provider
      value={{
        userMetrics,
        userMetricsLoading,
        userMetricsError,
        fetchUserMetrics,
        revenueMetrics,
        revenueMetricsLoading,
        revenueMetricsError,
        fetchRevenueMetrics,
        resumeMetrics,
        resumeMetricsLoading,
        resumeMetricsError,
        fetchResumeMetrics,
        refreshAllMetrics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
