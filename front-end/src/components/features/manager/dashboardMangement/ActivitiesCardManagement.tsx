import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useGetEventLogsQuery } from "@/services/eventLogApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function ActivitiesCardManagement() {
  // Fetch data
  const { data: eventRes } = useGetEventLogsQuery({
    page: 1,
    limit: 100,
  });

  // Extract data safely
  const events = eventRes?.data?.eventLogs ?? [];

  // Helper function - Get recent activities
  const getRecentActivities = () => {
    return events.slice(0, 6).map((e) => {
      const operatorName =
        typeof e.operator === "string"
          ? e.operator
          : e.operator?.name || "Không xác định";
      return {
        id: e.id,
        action: e.action || "Hành động",
        operator: operatorName,
        time: e.timestamp ? dayjs(e.timestamp).fromNow() : "Không xác định",
        status: e.status || "info",
      };
    });
  };

  const recentActivities = getRecentActivities();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Hoạt động Gần đây
          </CardTitle>
          <button
            onClick={() => (window.location.href = "/lab_manager/event-log")}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
          >
            Xem chi tiết
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${
                    activity.status === "error"
                      ? "bg-red-100"
                      : activity.status === "warning"
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  {activity.status === "error" ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : activity.status === "warning" ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    bởi {activity.operator}
                  </p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Không có hoạt động gần đây
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
