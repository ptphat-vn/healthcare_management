import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useGetAllTestOrderQuery } from '@/services/testOrderApi';

// Custom Tooltip Component
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const bgColor = data.payload.color;
    
    const total = payload[0].payload.total || 
                  payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div 
        className="px-8 py-1 rounded-xl shadow-2xl border-2"
        style={{ 
          backgroundColor: bgColor + '90',
          borderColor:  'rgba(255, 255, 255, 0.2)', 
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      >
        <p 
          className="font-semibold text-md" 
          style={{ color: '#ffffff' }}
        >
          {data.name}
        </p>
        <p 
          className="text-1xl font-bold" 
          style={{ color: '#ffffff' }}
        >
          {data.value} đơn
        </p>
        <p 
          className="text-xs opacity-80" 
          style={{ color: '#ffffff' }}
        >
          {percentage}% tổng số
        </p>
      </div>
    );
  }
  return null;
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

    const total = statusData.reduce((sum, item) => sum + item.value, 0);
    return statusData.map(item => ({ ...item, total }));
  };

  const alertStatus = getAlertStatus();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-123">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-slate-900">
          Phân bố Trạng thái
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Tỷ lệ đơn xét nghiệm
        </p>
      </CardHeader>
      <CardContent className="pt-6 ">
        <ResponsiveContainer width="115%" height={320}>
          <PieChart>
            <Pie
              data={alertStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {alertStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}