import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useGetAllUserQuery } from "@/services/userApi";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";
import dayjs from "dayjs";

export default function TrendChartManagement() {
  const { data: usersRes } = useGetAllUserQuery({
    limit: 10000,
  });
  const { data: testRes } = useGetAllTestOrderQuery({
    page: 1,
    limit: 10000,
    sortOrder: -1,
  });

  // Extract data safely
  const users = usersRes?.data?.user ?? [];
  const tests = testRes?.data?.testOrder ?? [];

  // Helper function - Get 7-day trend data
  const getTrendData = () => {
    const today = dayjs();
    const trendData = [];

    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, "days");
      const dateStr = date.format("DD/MM");

      const dayUsers = users.filter((u) => {
        const createdAt = dayjs(u.createdAt);
        return createdAt.format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
      }).length;

      const dayTests = tests.filter((t) => {
        const createdDate = dayjs(t.createdDate);
        return createdDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
      }).length;

      const dayCompleted = tests.filter((t) => {
        const createdDate = dayjs(t.createdDate);
        return (
          createdDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD") &&
          t.status === "completed"
        );
      }).length;

      trendData.push({
        date: dateStr,
        users: dayUsers,
        tests: dayTests,
        completed: dayCompleted,
      });
    }

    return trendData;
  };

  const trendData = getTrendData();
  return (
    <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Xu hướng 7 ngày
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Thống kê người dùng và xét nghiệm
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "none",
                borderRadius: "12px",
                color: "#f1f5f9",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsers)"
              name="Người dùng"
            />
            <Area
              type="monotone"
              dataKey="tests"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTests)"
              name="Xét nghiệm"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
