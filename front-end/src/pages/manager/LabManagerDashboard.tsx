import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import TotalCardManagement from "@/components/features/manager/dashboardMangement/TotalCardManagement/TotalCardManagement";
import TrendChartManagement from "@/components/features/manager/dashboardMangement/TrendChartManagement/TrendChartManagement";
import StatusDistributionManagement from "@/components/features/manager/dashboardMangement/StatusDistributionManagement/StatusDistributionManagement";
import ActivitiesCardManagement from "@/components/features/manager/dashboardMangement/ActivitiesCardManagement/ActivitiesCardManagement";
import StatusCardManagement from "@/components/features/manager/dashboardMangement/StatusCardManagement/StatusCardManagement";
import { useGetProfileQuery } from "@/services/baseApi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const LabManagerDashboard = () => {
  const { data: user } = useGetProfileQuery();
  const fullName = user?.data?.fullName || "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Dashboard Lab_Manager
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Hi{" "}
              <span style={{ fontWeight: 700, color: "#64748b" }}>
                {fullName}
              </span>
              , welcome back.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* KPI Cards */}
        <TotalCardManagement />

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-8">
          <div className="lg:col-span-5">
            <TrendChartManagement />
          </div>
          <div className="lg:col-span-3">
            <StatusDistributionManagement />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivitiesCardManagement />
          <StatusCardManagement />
        </div>
      </div>
    </div>
  );
};

export default LabManagerDashboard;
