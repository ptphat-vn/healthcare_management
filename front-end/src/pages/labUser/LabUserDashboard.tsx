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
  History,
  Bot,
  Edit,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  bgColor: string;
  iconColor: string;
}

function StatCard({ title, value, icon, trend, trendUp, iconColor }: StatCardProps) {
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
                className={`h-4 w-4 ${trendUp ? "text-green-600" : "text-red-600 rotate-180"}`}
              />
              <span className={`text-sm font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
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

  const { data: testOrdersData, isLoading: isLoadingTests } = useGetAllTestOrderQuery({
    page: 1,
    limit: 100,
    sortBy: "createdDate",
    sortOrder: -1,
  });

  const stats = useMemo(() => {
    const testOrders = (testOrdersData?.data as any)?.testOrder || [];
    const totalTestOrders = testOrders.length;
    const pendingTests = testOrders.filter((t: TestOrder) => t.status === "pending").length;
    const completedTotal = testOrders.filter((t: TestOrder) => t.status === "completed").length;
    const aiReviewed = testOrders.filter((t: TestOrder) => t.status === "ai_reviewed").length;
    const reviewed = testOrders.filter((t: TestOrder) => t.status === "reviewed").length;

    return {
      totalTestOrders,
      pendingTests,
      completedTotal,
      aiReviewed,
      reviewed,
    };
  }, [testOrdersData]);

  const recentTests = useMemo(() => {
    const testOrders = (testOrdersData?.data as any)?.testOrder || [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return testOrders
      .filter((test: TestOrder) => {
        const testDate = new Date(test.createdDate || "");
        return testDate >= last24Hours;
      })
      .slice(0, 100)
      .map((test: TestOrder) => ({
        id: test._id,
        patientName: test.patientName || "N/A",
        phoneNumber: test.phoneNumber || "N/A",
        email: test.email || "N/A",
        status: test.status,
        priority: test.comments?.some(c => c.content?.toLowerCase().includes("urgent")) ? "URGENT" : "NORMAL",
        date: test.createdDate ? new Date(test.createdDate).toLocaleDateString() : "N/A",
        time: test.createdDate ? new Date(test.createdDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
        createdByUser: test.createdByUser?.fullName || test.createdBy || "Unknown User",
      }));
  }, [testOrdersData]);

  if (isLoadingRecords || isLoadingTests) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {user?.data?.fullName || "Lab User"}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your lab today
            </p>
          </div>
          {/* <div className="hidden md:flex items-center gap-4">
            <div className="text-right bg-white/20 px-6 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium opacity-90">Today's Date</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            <div className="text-right bg-white/20 px-6 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium opacity-90">Current Time</p>
              <p className="text-xl font-bold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div> */}
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

      <Card className="p-6 shadow-lg border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
              <p className="text-sm text-gray-500">Lịch sử thao tác test order trong 24 giờ qua</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {recentTests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có hoạt động gần đây
            </div>
          ) : (
            recentTests.map((test: any, index: number) => {
              const actionTypes = ['create', 'update', 'view', 'delete'];
              const actionType = actionTypes[index % actionTypes.length];

              const actionText =
                actionType === 'create' ? `Tạo test order mới cho bệnh nhân ${test.patientName}` :
                  actionType === 'update' ? `Cập nhật test order của ${test.patientName}` :
                    actionType === 'view' ? `Xem test order của ${test.patientName}` :
                      `Xóa test order của ${test.patientName}`;

              const iconColor =
                actionType === 'create' ? 'text-green-600' :
                  actionType === 'update' ? 'text-blue-600' :
                    actionType === 'view' ? 'text-purple-600' :
                      'text-red-600';

              return (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      {actionType === 'create' && <FileText className={`h-4 w-4 ${iconColor}`} />}
                      {actionType === 'update' && <Edit className={`h-4 w-4 ${iconColor}`} />}
                      {actionType === 'view' && <Eye className={`h-4 w-4 ${iconColor}`} />}
                      {actionType === 'delete' && <Trash2 className={`h-4 w-4 ${iconColor}`} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {actionText}
                      </p>
                      <p className="text-sm text-gray-500">
                        {test.createdByUser}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{test.time}</span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
