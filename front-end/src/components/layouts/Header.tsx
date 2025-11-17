import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, User, Menu } from "lucide-react";
import Notification from "@/components/common/Notification";
import { Button } from "@/components/ui/button";
import { useGetProfileQuery } from "@/services/baseApi";
import { useEffect } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

// Role color mapping
const getRoleHeaderClass = (roleCode: string) => {
  const roleColorMap: Record<string, string> = {
    admin: "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700",
    lab_manager: "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700",
    lab_user: "bg-gradient-to-r from-green-600 via-emerald-600 to-green-700",
    service: "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700",
    patient: "bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700",
  };
  return (
    roleColorMap[roleCode] ||
    "bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500"
  );
};

const getRoleBadgeClass = (roleCode: string) => {
  const badgeMap: Record<string, string> = {
    admin: "badge-admin",
    lab_manager: "badge-lab-manager",
    lab_user: "badge-lab-user",
    service: "badge-service",
    patient: "badge-patient",
  };
  return (
    badgeMap[roleCode] ||
    "bg-white/20 text-white px-2 py-0.5 rounded-full text-xs"
  );
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { logout, user, isAuthenticated } = useAuth();

  // Refetch profile to get latest avatar
  const { data: latestProfile, refetch } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Use latest profile data if available, otherwise use cached user
  const currentUser = latestProfile || user;

  const fullName = currentUser?.data?.fullName || "Patient";
  const initial = (fullName.charAt(0) || "U").toUpperCase();
  const roleCode = currentUser?.data?.roleCode || "patient";
  const roleLabel = (
    currentUser?.data?.roleName ||
    currentUser?.data?.roleCode ||
    "Patient"
  ).toString();

  const headerColorClass = getRoleHeaderClass(roleCode);
  const roleBadgeClass = getRoleBadgeClass(roleCode);

  // Listen for avatar update events
  useEffect(() => {
    const handleAvatarUpdate = () => {
      refetch();
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
    };
  }, [refetch]);

  return (
    <header className="sticky top-0 z-50">
      <div className={`${headerColorClass} text-white shadow-xl`}>
        <div className="w-full flex items-center justify-between h-16 md:h-20">
          {/* Left Section with Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10 h-10 w-10"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg ring-1 ring-white/20 hover:bg-white/20 transition-all">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12h4l3-8 4 16 3-10h4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                  CareCenter
                </h1>
                <p className="text-xs text-white/80 -mt-0.5">
                  Healthcare management
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-1" />

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 pr-3 sm:pr-4">
            {/* Notifications Component */}
            <Notification />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="flex cursor-pointer items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white/20 text-white rounded-full font-bold text-xs sm:text-sm ring-2 ring-white/30 overflow-hidden">
                    {currentUser?.data?.avatar ? (
                      <img
                        src={currentUser.data.avatar}
                        alt={fullName}
                        className="w-full h-full object-cover rounded-full"
                        key={currentUser.data.avatar} // Force re-render on avatar change
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-semibold leading-4">
                      {fullName}
                    </span>
                    <span
                      className={`text-xs font-medium mt-0.5 ${roleBadgeClass}`}
                    >
                      {roleLabel}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 cursor-pointer">
                <div className="px-2 py-2 border-b">
                  <p className="text-sm font-semibold text-gray-900">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.data?.email}
                  </p>
                </div>
                <DropdownMenuItem className="cursor-pointer px-3 py-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <Link
                    to={`/${currentUser?.data.roleCode}/profile`}
                    className="w-full block text-sm font-medium text-gray-700"
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer px-3 py-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <Link
                    to="/app/settings"
                    className="w-full block text-sm font-medium text-gray-700"
                  >
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer font-semibold px-3 py-2 flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
