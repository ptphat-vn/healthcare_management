import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  Crown,
  User,
  Edit,
} from "lucide-react";

import { useGetAllUserQuery } from "@/services/userApi";
import { useGetAllRoleQuery } from "@/services/roleApi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersToday: number;
  adminUsers: number;
  regularUsers: number;
  blockedUsers: number;
}

interface UserActivity {
  action: string;
  user: string;
  time: string;
  type: "create" | "update" | "delete" | "login";
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
  color: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0,
    newUsersToday: 0,
    adminUsers: 0,
    regularUsers: 0,
    blockedUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);

  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useGetAllUserQuery({
    limit: 10000,
  });

  const { data: rolesData } = useGetAllRoleQuery({
    limit: 10000,
  });

  useEffect(() => {
    if (usersData?.data.user) {
      const users = usersData.data.user;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalUsers = users.length;
      const activeUsers = users.filter((user) => user.status === 1).length;
      const inactiveUsers = users.filter((user) => user.status === 0).length;
      const blockedUsers = users.filter((user) => user.status === 2).length;

      const newUsersThisMonth = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= thisMonth;
      }).length;

      const newUsersToday = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= today;
      }).length;

      const adminUsers = users.filter(
        (user) => user.roleCode === "admin"
      ).length;
      const regularUsers = users.filter(
        (user) => user.roleCode !== "admin"
      ).length;

      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth,
        newUsersToday,
        adminUsers,
        regularUsers,
        blockedUsers,
      });

      const allActivities: (UserActivity & { timestamp: number })[] = [];

      const newUsers = [...users]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10);

      newUsers.forEach((user) => {
        allActivities.push({
          action: "Đăng ký tài khoản mới",
          user: user.fullName || user.email,
          time: getTimeAgo(new Date(user.createdAt)),
          type: "create" as const,
          timestamp: new Date(user.createdAt).getTime(),
        });
      });

      const updatedUsers = [...users]
        .filter((user) => {
          const created = new Date(user.createdAt).getTime();
          const updated = new Date(user.updatedAt).getTime();
          return updated - created > 60000;
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 10);

      updatedUsers.forEach((user) => {
        allActivities.push({
          action: "Cập nhật thông tin tài khoản",
          user: user.fullName || user.email,
          time: getTimeAgo(new Date(user.updatedAt)),
          type: "update" as const,
          timestamp: new Date(user.updatedAt).getTime(),
        });
      });

      const recentBlockedUsers = [...users]
        .filter((user) => user.status === 2)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 10);

      recentBlockedUsers.forEach((user) => {
        allActivities.push({
          action: "Khóa tài khoản",
          user: user.fullName || user.email,
          time: getTimeAgo(new Date(user.updatedAt)),
          type: "delete" as const,
          timestamp: new Date(user.updatedAt).getTime(),
        });
      });

      const sortedActivities = allActivities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)
        .map(({ timestamp, ...activity }) => activity);

      setRecentActivities(sortedActivities);
    }
  }, [usersData]);

  useEffect(() => {
    if (isError) {
      toast.error("Không thể tải dữ liệu người dùng");
      console.error("Error fetching users:", error);
    }
  }, [isError, error]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const roleDistribution: RoleDistribution[] = (() => {
    if (!rolesData?.data?.role || rolesData.data.role.length === 0) {
      return [];
    }

    const users = usersData?.data?.user || [];
    const allRoles = rolesData.data.role;
    const roleCounts: Record<string, number> = {};
    users.forEach((user) => {
      const roleName = user.roleName || user.roleCode || "Unknown";
      roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
    });

    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];

    return allRoles
      .map((role, index) => ({
        role: role.name,
        count: roleCounts[role.name] || 0,
        percentage:
          users.length > 0
            ? ((roleCounts[role.name] || 0) / users.length) * 100
            : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
  })();

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      icon: Users,
      iconColor: "#2563eb",
    },
    {
      title: "Người dùng hoạt động",
      value: stats.activeUsers,
      icon: UserCheck,
      iconColor: "#16a34a",
    },
    {
      title: "Người dùng mới tháng này",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
      iconColor: "#9333ea",
    },
    {
      title: "Người dùng mới hôm nay",
      value: stats.newUsersToday,
      icon: UserPlus,
      iconColor: "#0891b2",
    },
    {
      title: "Quản trị viên",
      value: stats.adminUsers,
      icon: Shield,
      iconColor: "#4f46e5",
    },
    {
      title: "Người dùng thường",
      value: stats.regularUsers,
      icon: User,
      iconColor: "#6b7280",
    },
    {
      title: "Người dùng không hoạt động",
      value: stats.inactiveUsers,
      icon: Activity,
      iconColor: "#ea580c",
    },
    {
      title: "Tài khoản bị khóa",
      value: stats.blockedUsers,
      icon: UserX,
      iconColor: "#dc2626",
    },
  ];

  return (
     <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {user?.data?.fullName || "Admin"}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Tổng quan về tất cả người dùng trong hệ thống
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
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-6 border-l-4"
              style={{ borderLeftColor: stat.iconColor }}
            >
              <div className="flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <Icon className="h-5 w-5" style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {isLoading ? "..." : stat.value}
                  </h3>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Crown className="h-5 w-5 mr-2 text-purple-600" />
              Phân bố vai trò
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {roleDistribution.map((role, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {role.role}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {role.count} người
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${role.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${role.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {role.percentage.toFixed(1)}% tổng số
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "create"
                          ? "bg-green-100"
                          : activity.type === "update"
                          ? "bg-blue-100"
                          : activity.type === "delete"
                          ? "bg-red-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {activity.type === "create" ? (
                        <UserPlus className="h-4 w-4 text-green-600" />
                      ) : activity.type === "update" ? (
                        <Edit className="h-4 w-4 text-blue-600" />
                      ) : activity.type === "delete" ? (
                        <UserX className="h-4 w-4 text-red-600" />
                      ) : (
                        <Shield className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols gap-6">
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Thống kê chi tiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Tỷ lệ hoạt động
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {stats.totalUsers > 0
                    ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">
                    Tăng trưởng tháng này
                  </span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  +{stats.newUsersThisMonth}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-700">
                    Tỷ lệ quản trị viên
                  </span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {stats.totalUsers > 0
                    ? ((stats.adminUsers / stats.totalUsers) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-700">
                    Tài khoản cần xem xét
                  </span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {stats.blockedUsers}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
