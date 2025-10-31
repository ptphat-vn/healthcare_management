import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  FileText,
  HeartPulse,
  MessageCircle,
  Bell,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

const stats = [
  {
    label: "Visits",
    value: 12,
    icon: <CalendarDays className="w-5 h-5 text-blue-400" />,
  },
  {
    label: "Records",
    value: 5,
    icon: <FileText className="w-5 h-5 text-green-400" />,
  },
  {
    label: "Messages",
    value: 23,
    icon: <MessageCircle className="w-5 h-5 text-indigo-400" />,
  },
  {
    label: "Status",
    value: "Good",
    icon: <HeartPulse className="w-5 h-5 text-pink-400" />,
  },
];

const notifications = [
  {
    id: 1,
    message: "Your next appointment is on 05/11/2025.",
    icon: <Bell className="w-4 h-4 text-yellow-400" />,
  },
  {
    id: 2,
    message: "New message from Dr. Smith.",
    icon: <MessageCircle className="w-4 h-4 text-indigo-400" />,
  },
];

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const fullName = user?.data?.fullName || "Patient";
  const avatar =
    user?.data?.avatar || "https://randomuser.me/api/portraits/men/32.jpg";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8">
      {/* Welcome Header */}
      <div className="flex flex-col items-center mb-12">
        <img
          src={avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-blue-100 shadow-lg object-cover"
        />
        <h2 className="mt-3 text-4xl font-bold text-gray-800 tracking-tight">
          {getGreeting()}, {fullName}! 👋
        </h2>
        <p className="mt-1 text-base text-gray-500">
          Welcome back to your health dashboard
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow hover:shadow-md px-6 py-4 transition-all duration-200"
          >
            <div className="bg-gray-50 rounded-full p-2">{stat.icon}</div>
            <div>
              <div className="text-xl font-bold text-gray-700">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
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
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-100 shadow p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Latest Notifications
        </h3>
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="flex items-center gap-3 text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
            >
              {n.icon}
              <span>{n.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
