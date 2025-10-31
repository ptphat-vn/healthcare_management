import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ClipboardPlus,
  History,
  LayoutDashboard,
  ShieldUser,
  TestTubeDiagonal,
  User,
  UserCog,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

export default function SideBar() {
  const { user } = useAuth();

  // safe role extraction

  const role = String(user?.data.roleCode || "patient").toLowerCase();

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
      {
        label: "Role Management",
        to: "/admin/roles-management",
        icon: <ShieldUser />,
      },
      {
        label: "Medical Records",
        to: "/admin/medical-records",
        icon: <ClipboardPlus />,
      },
      {
        label: "Test Order",
        to: "/admin/test-order",
        icon: <TestTubeDiagonal />,
      },
      {
        label: "Event Log",
        to: "/admin/event-log",
        icon: <History />,
      },
    ],
    lab_manager: [
      {
        label: "Dashboard",
        to: "/lab_manager/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        label: "User Management",
        to: "/lab_manager/user-management",
        icon: <Users />,
      },
      {
        label: "Roles Management",
        to: "/lab_manager/roles-management",
        icon: <ShieldUser />,
      },
      {
        label: "Medical Record",
        to: "/lab_manager/medical-record",
        icon: <ClipboardPlus />,
      },
      {
        label: "Test Order",
        to: "/lab_manager/test-order",
        icon: <TestTubeDiagonal />,
      },
      {
        label: "Event Log",
        to: "/lab_manager/event-log",
        icon: <History />,
      },
      { label: "Reports", to: "/lab_manager/reports" },
    ],
    lab_user: [
      {
        label: "Dashboard",
        to: "/lab_user/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        label: "Medical Records",
        to: "/lab_user/medical-records",
        icon: <ClipboardPlus />,
      },
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
    patient: [
      {
        label: "Dashboard",
        to: "/patient/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        label: "Medical Record",
        to: "/patient/medical-record",
        icon: <ClipboardPlus />,
      },
      { label: "Profile", to: "/patient/profile", icon: <User /> },
    ],
  };

  const items = menus[role] ?? menus["user"];

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen">
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
