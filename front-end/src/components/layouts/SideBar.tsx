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
  FlaskConical,
<<<<<<< HEAD
  MessageCircle,
=======
  X,
>>>>>>> 643c2f3221e1da7bf4efadf36ba85b79e01c63ea
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  to: string;
  icon?: ReactNode;
}

interface SideBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SideBar({ open, onOpenChange }: SideBarProps) {
  const { user } = useAuth();
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
      {
        label: "Test Order",
        to: "/lab_user/test-order",
        icon: <TestTubeDiagonal />,
      },
      {
        label: "Event Log",
        to: "/lab_user/event-log",
        icon: <History />,
      },
        {
          label: "Chat",
          to: "/lab_user/chat",
          icon: <MessageCircle />,
        },
      {
        label: "Reagent",
        to: "/lab_user/reagent-management",
        icon: <ClipboardPlus />,
      },
    ],
    consultant: [
      {
        label: "Dashboard",
        to: "/consultant/dashboard",
        icon: <LayoutDashboard />,
      },
    ],
    service: [
      {
        label: "Dashboard",
        to: "/service/dashboard",
        icon: <LayoutDashboard />,
      },
      {
        label: "Instruments",
        to: "/service/instruments",
        icon: <FlaskConical />,
      },
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
      {
        label: "Chat",
        to: "/patient/chat",
        icon: <MessageCircle />,
      },
      { label: "Profile", to: "/patient/profile", icon: <User /> },
    ],
  };

  const items = menus[role] ?? menus["patient"];
  const roleLabel = user?.data?.roleName || "Menu";

  // Get role-specific classes
  const getSidebarItemClasses = (isActive: boolean) => {
    const baseClass = "sidebar-item";
    const roleClass = `sidebar-item-${role.replace("_", "-")}`;
    const activeClass = `sidebar-item-${role.replace("_", "-")}-active`;

    if (isActive) {
      return cn(baseClass, activeClass);
    }
    return cn(baseClass, roleClass);
  };

  const SidebarContent = () => (
    <ScrollArea className="h-full py-4 px-3">
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onOpenChange(false)}
            className={({ isActive }) => getSidebarItemClasses(isActive)}
          >
            {item.icon && (
              <div className="flex items-center justify-center w-6 h-6">
                {item.icon}
              </div>
            )}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </ScrollArea>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">{roleLabel}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-white">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 font-bold">
            {roleLabel}
          </h2>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
