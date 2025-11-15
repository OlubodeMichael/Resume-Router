"use client";

import { useEffect, useState } from "react";
import { AnalyticsProvider, useAnalytics } from "@/hooks/analysticsProvider";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  DollarSign, 
  RefreshCw,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from "lucide-react";

type Period = "day" | "week" | "month" | "all";

function AdminDashboardContent() {
  const {
    userMetrics,
    userMetricsLoading,
    userMetricsError,
    revenueMetrics,
    revenueMetricsLoading,
    revenueMetricsError,
    resumeMetrics,
    resumeMetricsLoading,
    resumeMetricsError,
    refreshAllMetrics,
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("all");

  useEffect(() => {
    refreshAllMetrics(selectedPeriod);
  }, [selectedPeriod, refreshAllMetrics]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const periods: { value: Period; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: "month", label: "Last Month" },
    { value: "week", label: "Last Week" },
    { value: "day", label: "Last 24 Hours" },
  ];

  const isLoading = userMetricsLoading || revenueMetricsLoading || resumeMetricsLoading;
  const hasError = userMetricsError || revenueMetricsError || resumeMetricsError;

  // Calculate trends (mock for now, can be enhanced with actual comparison data)
  const calculateTrend = (current: number, previous: number = current * 0.95) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor your SaaS metrics and performance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => refreshAllMetrics(selectedPeriod)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {hasError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Error loading metrics</p>
              <p className="text-red-600 text-sm mt-1">
                {userMetricsError || revenueMetricsError || resumeMetricsError}
              </p>
            </div>
          </div>
        )}

        {/* Key Metrics Cards - Top Row */}
        {userMetrics && revenueMetrics && resumeMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedMetricCard
              title="Total Users"
              value={formatNumber(userMetrics.totalUsers)}
              icon={Users}
              trend={calculateTrend(userMetrics.totalUsers, userMetrics.totalUsers - userMetrics.newSignups)}
              subtitle="Active accounts"
              color="blue"
            />
            <EnhancedMetricCard
              title="Total Revenue"
              value={formatCurrency(revenueMetrics.revenue.stripe.total)}
              icon={DollarSign}
              trend={calculateTrend(revenueMetrics.revenue.stripe.total)}
              subtitle="All-time revenue"
              color="green"
            />
            <EnhancedMetricCard
              title="Resumes Generated"
              value={formatNumber(resumeMetrics.totalResumes)}
              icon={FileText}
              trend={calculateTrend(resumeMetrics.totalResumes)}
              subtitle="Total generated"
              color="purple"
            />
            <EnhancedMetricCard
              title="Conversion Rate"
              value={formatPercentage(revenueMetrics.conversion.signupsToGenerators)}
              icon={BarChart3}
              trend={calculateTrend(revenueMetrics.conversion.signupsToGenerators)}
              subtitle="Signups → Generators"
              color="orange"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          {userMetrics && userMetrics.signupsBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                  <p className="text-sm text-gray-500 mt-1">New signups over time</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-end gap-2">
                {userMetrics.signupsBreakdown.slice(-30).map((day, index) => {
                  const maxCount = Math.max(...userMetrics.signupsBreakdown.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          <div className="font-semibold">{day.count} signups</div>
                          <div className="text-gray-300">{new Date(day.date).toLocaleDateString()}</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                      {index % 5 === 0 && (
                        <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Credit Usage Chart */}
          {revenueMetrics && revenueMetrics.credits.usageTrend.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Credit Activity</h3>
                  <p className="text-sm text-gray-500 mt-1">Purchased vs Used</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Purchased</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Used</span>
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-end gap-1">
                {revenueMetrics.credits.usageTrend.slice(-30).map((day, index) => {
                  const maxUsed = Math.max(...revenueMetrics.credits.usageTrend.map(d => d.creditsUsed));
                  const maxPurchased = Math.max(...revenueMetrics.credits.usageTrend.map(d => d.creditsPurchased));
                  const maxValue = Math.max(maxUsed, maxPurchased, 1);
                  const usedHeight = (day.creditsUsed / maxValue) * 100;
                  const purchasedHeight = (day.creditsPurchased / maxValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                      <div className="w-full flex gap-0.5">
                        <div
                          className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-t transition-all duration-300 hover:from-red-700 hover:to-red-500 cursor-pointer"
                          style={{ height: `${Math.max(usedHeight, 2)}%` }}
                          title={`Used: ${formatNumber(day.creditsUsed)}`}
                        />
                        <div
                          className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all duration-300 hover:from-green-700 hover:to-green-500 cursor-pointer"
                          style={{ height: `${Math.max(purchasedHeight, 2)}%` }}
                          title={`Purchased: ${formatNumber(day.creditsPurchased)}`}
                        />
                      </div>
                      {index % 5 === 0 && (
                        <span className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Metrics */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Metrics</h3>
                <p className="text-sm text-gray-500">User activity overview</p>
              </div>
            </div>
            {userMetricsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : userMetrics ? (
              <div className="space-y-6">
                <MetricRow label="Active Users" value={formatNumber(userMetrics.activeUsers)} />
                <MetricRow label="Users with Resumes" value={formatNumber(userMetrics.usersWithResumes)} percentage={`${formatPercentage((userMetrics.usersWithResumes / userMetrics.totalUsers) * 100)}`} />
                <MetricRow label="Empty Profiles" value={formatNumber(userMetrics.usersWithNoProfile)} />
                <MetricRow label="New Signups" value={formatNumber(userMetrics.newSignups)} trend={userMetrics.newSignups > 0 ? "positive" : "neutral"} />
              </div>
            ) : null}
          </div>

          {/* Revenue Metrics */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Metrics</h3>
                <p className="text-sm text-gray-500">Financial performance</p>
              </div>
            </div>
            {revenueMetricsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : revenueMetrics ? (
              <div className="space-y-6">
                <MetricRow label="Credits Purchased" value={formatNumber(revenueMetrics.credits.totalPurchased)} />
                <MetricRow label="Credits Used" value={formatNumber(revenueMetrics.credits.totalUsed)} percentage={`${formatPercentage((revenueMetrics.credits.totalUsed / revenueMetrics.credits.totalPurchased) * 100)}`} />
                <MetricRow label="Failed Payments" value={formatNumber(revenueMetrics.revenue.failedPayments)} />
                <MetricRow label="Generators" value={formatNumber(revenueMetrics.conversion.usersWhoGenerated)} subtitle={`of ${formatNumber(revenueMetrics.conversion.totalSignups)} signups`} />
              </div>
            ) : null}
          </div>

          {/* Resume Metrics */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resume Metrics</h3>
                <p className="text-sm text-gray-500">Generation statistics</p>
              </div>
            </div>
            {resumeMetricsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : resumeMetrics ? (
              <div className="space-y-6">
                <MetricRow label="Avg Generation Time" value={`${resumeMetrics.averageGenerationTimeMinutes.toFixed(1)} min`} />
                <MetricRow label="Multiple Resumes" value={formatPercentage(resumeMetrics.percentageMultipleResumes)} />
                <MetricRow label="Quality Issues" value={formatNumber(resumeMetrics.qualityIssues.emptyContent + resumeMetrics.qualityIssues.missingHeader + resumeMetrics.qualityIssues.missingExperience)} />
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-3">Status Breakdown</div>
                  <div className="space-y-2">
                    {resumeMetrics.statusBreakdown.map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{status.status}</span>
                        <span className="text-sm font-semibold text-gray-900">{formatNumber(status.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Top Job Roles */}
        {resumeMetrics && resumeMetrics.mostCommonJobRoles.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Most Common Job Roles</h3>
                <p className="text-sm text-gray-500 mt-1">Top roles users are targeting</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {resumeMetrics.mostCommonJobRoles.slice(0, 10).map((role, index) => (
                <div key={index} className="group p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{role.role}</div>
                  <div className="text-xs text-gray-500">{formatNumber(role.count)} resumes</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EnhancedMetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "blue",
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${iconBgClasses[color]} rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend.value.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
      <button className="mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        View more
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function MetricRow({
  label,
  value,
  percentage,
  subtitle,
  trend,
}: {
  label: string;
  value: string;
  percentage?: string;
  subtitle?: string;
  trend?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">{value}</div>
          {percentage && <div className="text-xs text-gray-500">{percentage}</div>}
        </div>
        {trend === "positive" && (
          <TrendingUp className="w-4 h-4 text-green-600" />
        )}
        {trend === "negative" && (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AnalyticsProvider>
      <AdminDashboardContent />
    </AnalyticsProvider>
  );
}
