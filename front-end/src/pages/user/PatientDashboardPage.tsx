import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  MessageCircle,
  Bell,
  CalendarDays,
  Activity,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useGetMedicalRecordsQuery } from "@/services/medicalRecordApi";
import { useGetNotificationsQuery } from "@/services/notificationApi";
import { useState, useEffect } from "react";
import type { Notification as NotificationType } from "@/types/notification.type";

const features = [
  {
    title: "Profile",
    description: "View and update your personal information.",
    icon: <User className="w-8 h-8 text-blue-400" />,
    color: "bg-blue-50 border-blue-100",
    path: "/patient/profile",
  },
  {
    title: "Medical Records",
    description: "Access your medical records and history.",
    icon: <FileText className="w-8 h-8 text-green-400" />,
    color: "bg-green-50 border-green-100",
    path: "/patient/medical-record",
  },
  {
    title: "Chat with Doctor",
    description: "Chat directly with your doctor using real-time messaging.",
    icon: <MessageCircle className="w-8 h-8 text-indigo-400" />,
    color: "bg-indigo-50 border-indigo-100",
    path: "/patient/chat",
  },
];

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fullName = user?.data?.fullName || "Patient";
  const role = "Patient";

  const getAvatarUrl = () => {
    if (user?.data?.avatar) {
      return user.data.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=3b82f6&color=ffffff&size=200&font-size=0.6`;
  };

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
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
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

  const recentNotifications =
    notificationsData?.data?.notifications
      ?.slice(0, 5)
      ?.map((notif: NotificationType) => ({
        id: notif._id,
        message: notif.title || notif.body,
        time: new Date(notif.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: notif.read,
      })) || [];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-rose-50 py-8 px-4 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[5fr,3fr]">
          <Card className="border border-blue-100 bg-white/80 shadow-xl backdrop-blur">
            <CardContent className="flex flex-col items-center gap-8 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={getAvatarUrl()}
                  alt={`${fullName}'s Avatar`}
                  className="h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-lg ring-4 ring-blue-100 transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      fullName
                    )}&background=3b82f6&color=ffffff&size=200&font-size=0.6`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-white bg-emerald-400 text-white shadow-md">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
                  HemoLab Management
                </div>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  {getGreeting()}, {fullName}! 👋
                </h1>
                <p className="text-base text-slate-600">
                  Stay on top of your health journey with real-time updates,
                  instant access to records, and direct lines to your care team.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/patient/profile")}
                  >
                    Update profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/patient/chat")}
                  >
                    Message doctor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-900/10 bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 text-white shadow-2xl">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-widest text-slate-300">
                  Status
                </p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  {role}
                </div>
                <p className="text-sm text-slate-400">
                  You are logged in with secure patient permissions.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-widest text-slate-300">
                  Local time
                </p>
                <div className="flex items-center gap-2 text-xl font-semibold">
                  <Clock className="h-5 w-5" />
                  {currentTime.toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quick insights
              </h2>
              <p className="text-sm text-slate-500">
                Refreshed automatically every minute.
              </p>
            </div>
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Overview
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-slate-50 p-3 text-slate-600 shadow-inner">
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    {stat.loading ? (
                      <div className="space-y-2">
                        <div className="h-6 w-24 rounded bg-slate-200 animate-pulse" />
                        <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-slate-900">
                          {typeof stat.value === "number" && stat.value > 999
                            ? `${(stat.value / 1000).toFixed(1)}k`
                            : stat.value}
                        </p>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-200 via-sky-200 to-indigo-200" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Take action
              </h2>
              <p className="text-sm text-slate-500">
                Jump straight to the page you need.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className={`relative flex h-full flex-col overflow-hidden border ${f.color} shadow hover:shadow-lg transition-all duration-200 group cursor-pointer`}
                  onClick={() => navigate(f.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(f.path);
                    }
                  }}
                >
                  <CardHeader className="flex flex-col items-start gap-4 pt-8 pb-2">
                    <div className="rounded-2xl bg-white/80 p-3 text-slate-700 shadow group-hover:scale-105 transition">
                      {f.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <p className="text-sm text-gray-500">{f.description}</p>
                  </CardContent>
                  <div className="absolute inset-x-6 bottom-4 h-px bg-linear-to-r from-blue-200 via-indigo-200 to-pink-200 opacity-70" />
                </Card>
              ))}
            </div>
          </div>

          <Card className="border border-slate-100 bg-white/90 shadow-lg">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-lg text-slate-900">
                Recent notifications
              </CardTitle>
              <p className="text-sm text-slate-500">
                Latest updates from your care team and system.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              {recentNotifications.length ? (
                recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-xl border border-slate-100 p-4 text-sm shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-slate-800">
                        {notif.message}
                      </p>
                      <span className="text-xs text-slate-400">
                        {notif.time}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                        New
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  You are all caught up. We'll drop your next update here.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
