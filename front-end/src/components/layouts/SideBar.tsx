import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ClipboardClock,
  ClipboardPlus,
  LayoutDashboard,
  ShieldUser,
  TestTubeDiagonal,
  UserCog,
} from "lucide-react";
import type { ReactNode } from "react";

export default function SideBar() {
  const { user } = useAuth();

  // safe role extraction

  const role = String(user?.data.role).toLowerCase();

  // define menus per role
  const menus: Record<
    string,
    { label: string; to: string; icon?: ReactNode }[]
  > = {
    admin: [
      { label: "Dashboard", to: "/admin/dashboard", icon: <LayoutDashboard /> },
      {
        label: "Users Management",
        to: "/admin/user-management",
        icon: <UserCog />,
      },
      { label: "Role Management", to: "/admin/roles", icon: <ShieldUser /> },
      {
        label: "Medical Records Management",
        to: "/admin/medical-records",
        icon: <ClipboardPlus />,
      },
      {
        label: "Test Order Management",
        to: "/admin/test-order",
        icon: <TestTubeDiagonal />,
      },
      {
        label: "Monitoring Service",
        to: "/admin/monitoring",
        icon: <ClipboardClock />,
      },
    ],
    manager: [
      {
        label: "Dashboard",
        to: "/manager/dashboard",
        icon: <LayoutDashboard />,
      },
      { label: "Reports", to: "/manager/reports" },
    ],
    consultant: [
      {
        label: "Dashboard",
        to: "/consultant/dashboard",
        icon: <LayoutDashboard />,
      },
      { label: "Clients", to: "/consultant/clients" },
    ],
    service: [
      {
        label: "Dashboard",
        to: "/service/dashboard",
        icon: <LayoutDashboard />,
      },
      { label: "Services", to: "/service/list" },
    ],
    user: [
      { label: "Dashboard", to: "/user/dashboard", icon: <LayoutDashboard /> },
      { label: "Profile", to: "/user/profile" },
    ],
  };

  const items = menus[role] ?? menus["user"];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <div className="space-y-2 mb-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 rounded hover:bg-gray-100 ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
                }`
              }
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 24, height: 24, cursor: "default" }}
              >
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
