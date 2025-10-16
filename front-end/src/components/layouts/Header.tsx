import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="bg-white text-gray-900 border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        <Link
          to={"/"}
          className="flex items-center space-x-3"
          data-discover="true"
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div
                className="flex items-center justify-center"
                style={{ width: 24, height: 24, cursor: "default" }}
              >
                <svg viewBox="0 0 56 56" fill="none">
                  <path
                    d="M6 32h10l6-16 12 40 6-24h10"
                    stroke="#222"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-md font-bold">CareCenter</h1>
            </div>
          </div>
        </Link>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                type="button"
                id="radix-«r0»"
                aria-haspopup="menu"
                aria-expanded="false"
                data-state="closed"
                data-slot="dropdown-menu-trigger"
              >
                <span className="text-white font-semibold">
                  {user?.data?.fullName.charAt(0).toUpperCase() || "U"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <Link to={"/app/profile"}>
                  {(user?.data.roleName || user?.data.roleCode || "User").toString().toUpperCase()} ACCOUNT
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
