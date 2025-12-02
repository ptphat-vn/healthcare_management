import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetAllTestOrderQuery } from "@/services/testOrderApi";

// Custom Tooltip Component
const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string; total?: number; originalValue?: number };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const bgColor = data.payload.color;
    // Use original value for accurate statistics display
    const actualValue =
      data.payload.originalValue !== undefined
        ? data.payload.originalValue
        : data.value;

    const total =
      payload[0].payload.total ||
      payload.reduce((sum, entry) => {
        const entryValue =
          entry.payload?.originalValue !== undefined
            ? entry.payload.originalValue
            : entry.value;
        return sum + (entryValue || 0);
      }, 0);
    const percentage = total > 0 ? ((actualValue / total) * 100).toFixed(1) : 0;

    return (
      <div
        className="px-8 py-1 rounded-xl shadow-2xl border-2"
        style={{
          backgroundColor: bgColor + "90",
          borderColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        <p className="font-semibold text-md" style={{ color: "#ffffff" }}>
          {data.name}
        </p>
        <p className="text-1xl font-bold" style={{ color: "#ffffff" }}>
          {actualValue} orders
        </p>
        <p className="text-xs opacity-80" style={{ color: "#ffffff" }}>
          {percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

// Custom Label Component - renders labels inside the pie chart
const CustomLabel = (props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) => {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  } = props;

  const RADIAN = Math.PI / 180;
  // Position label at the center of the donut ring
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Calculate font size based on chart size - larger and more readable
  const fontSize = Math.max(12, Math.min(16, outerRadius * 0.18));
  // Round to 0% if percent is very small (to handle 0.001 values used for visualization only)
  // This ensures 0% segments display as "0%" even though they have a tiny value for rendering
  const percentage = percent < 0.001 ? "0" : (percent * 100).toFixed(0);

  // Always show percentage, even if 0%
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      fontWeight="700"
      style={{
        textShadow: "0 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.3)",
        pointerEvents: "none",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {`${percentage}%`}
    </text>
  );
};

export default function StatusDistributionManagement() {
  const { data: testRes } = useGetAllTestOrderQuery({
    page: 1,
    limit: 10000,
    sortOrder: -1,
  });

  const tests = testRes?.data?.testOrder ?? [];

  const getAlertStatus = () => {
    const statusData = [
      {
        name: "Pending",
        value: tests.filter((t) => t.status === "pending").length,
        color: "#F59E0B",
      },
      {
        name: "In Progress",
        value: tests.filter((t) => t.status === "reviewed").length,
        color: "#3B82F6",
      },
      {
        name: "Completed",
        value: tests.filter((t) => t.status === "completed").length,
        color: "#10B981",
      },
      {
        name: "Cancelled",
        value: tests.filter((t) => t.status === "cancelled").length,
        color: "#EF4444",
      },
    ];

    const total = statusData.reduce((sum, item) => sum + item.value, 0);
    // Keep original values for accurate statistics
    // Only use a tiny value for 0% segments to ensure they render with color
    // This value is purely for visualization and doesn't affect the actual statistics
    return statusData.map((item) => ({
      ...item,
      total,
      // Store original value for tooltip and accurate display
      originalValue: item.value,
      // Use a very small value (0.001) only for rendering 0% segments with color
      // This is negligible and won't affect the actual percentage calculation
      value: item.value === 0 ? 0.001 : item.value,
    }));
  };

  const alertStatus = getAlertStatus();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full overflow-hidden">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-slate-900">Status Distribution</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Test order distribution</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={325}>
            <PieChart>
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px" }}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color, fontSize: "14px" }}>
                    {value}
                  </span>
                )}
              />
              <Pie
                data={alertStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius="70%"
                innerRadius="30%"
                fill="#8884d8"
                dataKey="value"
                minAngle={5}
              >
                {alertStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
