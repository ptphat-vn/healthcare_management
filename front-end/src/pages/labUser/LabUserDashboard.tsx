import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import type { TestOrder } from "@/types/testOrder.type";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Bot,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";

type TestOrdersResponse = {
  testOrder: TestOrder[];
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  iconColor,
}: StatCardProps) {
  return (
    <Card className="p-6 border-l-4" style={{ borderLeftColor: iconColor }}>
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon}
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1">
              <TrendingUp
                className={`h-4 w-4 ${
                  trendUp ? "text-green-600" : "text-red-600 rotate-180"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function LabUserDashboard() {
  const { user } = useAuth();

  const { isLoading: isLoadingRecords } = useGetMedicalRecordsQuery({
    page: 1,
    limit: 1,
    sortBy: "createdAt",
    sortOrder: -1,
  });

  const { data: testOrdersData, isLoading: isLoadingTests } =
    useGetAllTestOrderQuery({
      page: 1,
      limit: 100,
      sortBy: "createdDate",
      sortOrder: -1,
    });

  const stats = useMemo(() => {
    const testOrders =
      (testOrdersData?.data as TestOrdersResponse | undefined)?.testOrder ?? [];
    const totalTestOrders = testOrders.length;
    const pendingTests = testOrders.filter(
      (t: TestOrder) => t.status === "pending"
    ).length;
    const completedTotal = testOrders.filter(
      (t: TestOrder) => t.status === "completed"
    ).length;
    const aiReviewed = testOrders.filter(
      (t: TestOrder) => t.status === "ai_reviewed"
    ).length;
    const reviewed = testOrders.filter(
      (t: TestOrder) => t.status === "reviewed"
    ).length;

    return {
      totalTestOrders,
      pendingTests,
      completedTotal,
      aiReviewed,
      reviewed,
    };
  }, [testOrdersData]);

  const readinessStatus = useMemo(() => {
    const total = stats.totalTestOrders || 1;
    const completionRate =
      ((stats.completedTotal + stats.reviewed) / total) * 100;
    const backlogRate = (stats.pendingTests / total) * 100;

    return {
      completionRate: completionRate.toFixed(0),
      backlogRate: backlogRate.toFixed(0),
      aiCoverage: total ? ((stats.aiReviewed / total) * 100).toFixed(0) : "0",
    };
  }, [stats]);

  if (isLoadingRecords || isLoadingTests) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.data?.fullName || "Lab Specialist"} 👋
            </h1>
            <p className="text-blue-100 text-lg">
              A quick snapshot of the most important lab KPIs for today
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Test Orders"
          value={stats.totalTestOrders}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
          iconColor="#2563eb"
        />
        <StatCard
          title="Pending Tests"
          value={stats.pendingTests}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          bgColor="bg-yellow-50"
          iconColor="#ca8a04"
        />
        <StatCard
          title="Completed Tests"
          value={stats.completedTotal}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          bgColor="bg-green-50"
          iconColor="#16a34a"
        />
        <StatCard
          title="Reviewed"
          value={stats.reviewed}
          icon={<Eye className="h-5 w-5 text-indigo-600" />}
          bgColor="bg-indigo-50"
          iconColor="#4f46e5"
        />
        <StatCard
          title="AI Reviewed"
          value={stats.aiReviewed}
          icon={<Bot className="h-5 w-5 text-purple-600" />}
          bgColor="bg-purple-50"
          iconColor="#9333ea"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Operational Readiness
              </h2>
              <p className="text-sm text-gray-500">
                Track core workflow metrics at a glance
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">
                Completion rate
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {readinessStatus.completionRate}%
              </p>
              <p className="text-xs text-blue-700 mt-1">Reviewed + completed</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-700">
                Pending workload
              </p>
              <p className="text-3xl font-bold text-amber-900 mt-2">
                {readinessStatus.backlogRate}%
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Orders awaiting action
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-700">AI coverage</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {readinessStatus.aiCoverage}%
              </p>
              <p className="text-xs text-purple-700 mt-1">Orders AI-reviewed</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Status Breakdown
              </h2>
              <p className="text-sm text-gray-500">
                Detailed view of active orders
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Pending review",
                value: stats.pendingTests,
                description: "Awaiting sample processing or analyst assignment",
                color: "text-amber-600",
                barColor: "bg-amber-200",
              },
              {
                label: "Completed",
                value: stats.completedTotal,
                description: "Completed but not yet reviewed by a specialist",
                color: "text-green-600",
                barColor: "bg-green-200",
              },
              {
                label: "Reviewed (human)",
                value: stats.reviewed,
                description: "Finalized and ready for release",
                color: "text-indigo-600",
                barColor: "bg-indigo-200",
              },
              {
                label: "AI reviewed",
                value: stats.aiReviewed,
                description: "Automated insights ready for confirmation",
                color: "text-purple-600",
                barColor: "bg-purple-200",
              },
            ].map((item) => {
              const percentage =
                stats.totalTestOrders > 0
                  ? Math.round((item.value / stats.totalTestOrders) * 100)
                  : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-semibold ${item.color}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.value} ({percentage}%)
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${item.barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
