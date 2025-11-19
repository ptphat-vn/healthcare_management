import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";

export default function StatusCardManagement() {
  // Fetch data
  const { data: testRes } = useGetAllTestOrderQuery({
    page: 1,
    limit: 10000,
    sortOrder: -1,
  });

  // Extract data safely
  const tests = testRes?.data?.testOrder ?? [];

  // Helper function - Get alert status
  const getAlertStatus = () => {
    return [
      {
        name: "Chờ xử lý",
        value: tests.filter((t) => t.status === "pending").length,
        color: "#F59E0B",
      },
      {
        name: "Đang xử lý",
        value: tests.filter((t) => t.status === "reviewed").length,
        color: "#3B82F6",
      },
      {
        name: "Hoàn thành",
        value: tests.filter((t) => t.status === "completed").length,
        color: "#10B981",
      },
      {
        name: "Hủy",
        value: tests.filter((t) => t.status === "cancelled").length,
        color: "#EF4444",
      },
    ];
  };

  const alertStatus = getAlertStatus();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Thống kê Chi tiết
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-5">
          {alertStatus.map((status, idx) => {
            const total = alertStatus.reduce((sum, s) => sum + s.value, 0);
            const percentage = total > 0 ? (status.value / total) * 100 : 0;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {status.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-bold text-slate-900 min-w-[3rem] text-right">
                      {status.value}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
