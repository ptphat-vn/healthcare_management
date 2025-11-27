import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Clock,
  TestTube,
  TrendingDown,
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useGetAllUserQuery } from "@/services/userApi";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import { useGetEventLogsQuery } from "@/services/eventLogApi";
import dayjs from "dayjs";

export default function TotalCardManagement() {
  // Fetch data
  const { data: usersRes } = useGetAllUserQuery({
    limit: 10000,
  });
  const { data: medicalRes } = useGetMedicalRecordsQuery({
    page: 1,
    limit: 10000,
  });
  const { data: testRes } = useGetAllTestOrderQuery({
    page: 1,
    limit: 10000,
    sortOrder: -1,
  });
  const { data: eventRes } = useGetEventLogsQuery({
    page: 1,
    limit: 100,
  });

  // Extract data safely
  const users = usersRes?.data?.user ?? [];
  const records = medicalRes?.data?.patient ?? [];
  const tests = testRes?.data?.testOrder ?? [];
  const events = eventRes?.data?.eventLogs ?? [];

  // Calculate KPIs
  const getKPIs = () => {
    const today = dayjs();
    const sevenDaysAgo = today.subtract(7, "days");
    const thirtyDaysAgo = today.subtract(30, "days");

    const usersLast7Days = users.filter((u) => {
      const createdAt = dayjs(u.createdAt);
      return createdAt.isAfter(sevenDaysAgo);
    }).length;

    const usersLast30Days = users.filter((u) => {
      const createdAt = dayjs(u.createdAt);
      return createdAt.isAfter(thirtyDaysAgo);
    }).length;

    const testsLast7Days = tests.filter((t) => {
      const createdDate = dayjs(t.createdDate);
      return createdDate.isAfter(sevenDaysAgo);
    }).length;

    const testsLast30Days = tests.filter((t) => {
      const createdDate = dayjs(t.createdDate);
      return createdDate.isAfter(thirtyDaysAgo);
    }).length;

    const userGrowth =
      usersLast30Days > 0
        ? (usersLast7Days / (usersLast30Days / 4) - 1) * 100
        : 0;

    const testGrowth =
      testsLast30Days > 0
        ? (testsLast7Days / (testsLast30Days / 4) - 1) * 100
        : 0;

    return {
      totalUsers: users.length,
      usersLast7Days,
      userGrowth: userGrowth.toFixed(1),
      totalTests: tests.length,
      testsLast7Days,
      testGrowth: testGrowth.toFixed(1),
      totalAbnormal: records.filter(
        (r) => (r.medicalHistory?.chronicConditions?.length ?? 0) > 0
      ).length,
      abnormalRate:
        records.length > 0
          ? (
              (records.filter(
                (r) => (r.medicalHistory?.chronicConditions?.length ?? 0) > 0
              ).length /
                records.length) *
              100
            ).toFixed(1)
          : 0,
      totalAlerts: events.filter(
        (e) => e.status === "warning" || e.status === "error"
      ).length,
    };
  };

  const kpis = getKPIs();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card 1: Total Users */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-50">
            Total Users
          </CardTitle>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Users className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            {kpis.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            {parseFloat(kpis.userGrowth) >= 0 ? (
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+{kpis.userGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">{kpis.userGrowth}%</span>
              </div>
            )}
            <span className="text-blue-100 text-xs">
              +{kpis.usersLast7Days} in 7 days
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Total Tests */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-50">
            Test Orders
          </CardTitle>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <TestTube className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            {kpis.totalTests.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            {parseFloat(kpis.testGrowth) >= 0 ? (
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+{kpis.testGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">{kpis.testGrowth}%</span>
              </div>
            )}
            <span className="text-emerald-100 text-xs">
              +{kpis.testsLast7Days} in 7 days
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Equipment */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-50">
            Active Equipment
          </CardTitle>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Activity className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            {kpis.totalAbnormal}/32
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">{kpis.abnormalRate}%</span>
            </div>
            <span className="text-purple-100 text-xs">Activity Rate</span>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Alerts */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-50">
            System Alerts
          </CardTitle>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            {kpis.totalAlerts}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">2 need attention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
