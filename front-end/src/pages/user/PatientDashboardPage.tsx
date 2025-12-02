import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  FileText,
  HeartPulse,
  MessageCircle,
  Bell,
  CalendarDays,
  Activity,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import { useGetNotificationsQuery } from "@/services/notificationApi";
import { useState, useEffect } from "react";

const features = [
  {
    title: "Profile",
    description: "View and update your personal information.",
    icon: <User className="w-8 h-8 text-blue-400" />,
    color: "bg-blue-50 border-blue-100",
  },
  {
    title: "Medical Records",
    description: "Access your medical records and history.",
    icon: <FileText className="w-8 h-8 text-green-400" />,
    color: "bg-green-50 border-green-100",
  },
  {
    title: "Chat with Doctor",
    description: "Chat directly with your doctor using real-time messaging.",
    icon: <MessageCircle className="w-8 h-8 text-indigo-400" />,
    color: "bg-indigo-50 border-indigo-100",
  },
  {
    title: "Health Status",
    description: "Monitor your health status and vitals.",
    icon: <HeartPulse className="w-8 h-8 text-pink-400" />,
    color: "bg-pink-50 border-pink-100",
  },
];

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // API Queries
  const { data: medicalRecordsData, isLoading: recordsLoading } =
    useGetMedicalRecordsQuery(
      { page: 1, limit: 100 },
      { skip: !user?.data?._id }
    );

  const { data: notificationsData, isLoading: notificationsLoading } =
    useGetNotificationsQuery(
      { page: 1, limit: 10 },
      { skip: !user?.data?._id }
    );

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fullName = user?.data?.fullName || "Patient";
  const role = "Patient"; // Fixed role assignment

  // Avatar với fallback đẹp
  const getAvatarUrl = () => {
    if (user?.data?.avatar) {
      return user.data.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=3b82f6&color=ffffff&size=200&font-size=0.6`;
  };

  // Tính toán stats từ API data
  const stats = [
    {
      label: "Medical Records",
      value: medicalRecordsData?.data?.pagination?.total || 0,
      icon: <FileText className="w-5 h-5 text-green-400" />,
      loading: recordsLoading,
    },
    {
      label: "Notifications",
      value: notificationsData?.data?.pagination?.total || 0,
      icon: <Bell className="w-5 h-5 text-yellow-400" />,
      loading: notificationsLoading,
    },
    {
      label: "Last Visit",
      value: medicalRecordsData?.data?.patient?.[0]
        ? new Date(
            medicalRecordsData.data.patient[0].createdAt
          ).toLocaleDateString("vi-VN")
        : "No visits",
      icon: <CalendarDays className="w-5 h-5 text-blue-400" />,
      loading: recordsLoading,
    },
    {
      label: "Account Status",
      value: "Active",
      icon: <Activity className="w-5 h-5 text-pink-400" />,
      loading: false,
    },
  ];

  // Hiển thị notifications từ API
  const notifications =
    notificationsData?.data?.notifications?.slice(0, 5)?.map((notif: any) => ({
      id: notif._id,
      message: notif.message,
      time: new Date(notif.createdAt).toLocaleString("vi-VN"),
      icon: <Bell className="w-4 h-4 text-yellow-400" />,
      isRead: notif.isRead,
    })) || [];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8">
      {/* Welcome Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative">
          <img
            src={getAvatarUrl()}
            alt={`${fullName}'s Avatar`}
            className="w-28 h-28 rounded-full border-4 border-blue-100 shadow-xl object-cover transition-transform hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName
              )}&background=3b82f6&color=ffffff&size=200&font-size=0.6`;
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-4xl font-bold text-gray-800 tracking-tight">
          {getGreeting()}, {fullName}! 👋
        </h2>
        <p className="mt-2 text-base text-gray-500 flex items-center gap-2">
          <span>Welcome back to your health dashboard</span>
          <span className="text-gray-400">•</span>
          <span className="text-blue-500 font-medium">{role}</span>
        </p>
        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
          <Clock className="w-4 h-4" />
          {currentTime.toLocaleString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg px-6 py-5 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full p-3 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="flex-1">
                {stat.loading ? (
                  <>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-800">
                      {typeof stat.value === "number" && stat.value > 999
                        ? `${(stat.value / 1000).toFixed(1)}k`
                        : stat.value}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {stat.label}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {features.map((f) => (
          <Card
            key={f.title}
            className={`relative overflow-hidden border ${f.color} shadow hover:shadow-lg transition-all duration-200 group cursor-pointer`}
          >
            <CardHeader className="flex flex-col items-center pt-8 pb-2">
              <div className="mb-3 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <CardTitle className="text-lg font-semibold text-gray-700">
                {f.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-gray-500 text-sm">{f.description}</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-100 via-indigo-100 to-pink-100 opacity-60" />
          </Card>
        ))}
      </div>

      {/* Notifications */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-500" />
            </div>
            <span>Recent Notifications</span>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {notifications.length} items
          </span>
        </h3>

        {notificationsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((n: any) => (
              <li
                key={n.id}
                className={`group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 ${
                  n.isRead
                    ? "bg-gray-50 border-gray-100"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="mt-1">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${
                      n.isRead ? "text-gray-600" : "text-gray-800 font-medium"
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.time}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
