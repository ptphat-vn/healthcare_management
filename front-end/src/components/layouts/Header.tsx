import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";

export default function Header() {
  const { logout, user } = useAuth();
  const fullName = user?.data?.fullName || "User";
  const initial = (fullName.charAt(0) || "U").toUpperCase();
  const roleLabel = (
    user?.data?.roleName ||
    user?.data?.roleCode ||
    "User"
  ).toString();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-white shadow-xl">
        <div className="w-full flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center pl-3 sm:pl-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg ring-1 ring-white/20">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
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
                <h1 className="text-lg font-semibold tracking-tight">
                  CareCenter
                </h1>
                <p className="text-xs text-white/80 -mt-0.5">
                  Healthcare management
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-4 pr-3 sm:pr-4">
            <Link
              to="/notifications"
              className="relative p-2 rounded-md hover:bg-white/10 transition"
              aria-label="Notifications"
            >
              <Bell size={15} />

              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-indigo-700 bg-white rounded-full">
                5
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="flex items-center gap-3 px-3 py-1 rounded-md hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <div className="flex items-center justify-center w-9 h-9 bg-white/10 text-white rounded-full font-semibold">
                    {initial}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-medium leading-4">
                      {fullName}
                    </span>
                    <span className="text-xs text-white/80 -mt-0.5">
                      {roleLabel}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Link to="/app/profile" className="w-full block">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/app/settings" className="w-full block">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
