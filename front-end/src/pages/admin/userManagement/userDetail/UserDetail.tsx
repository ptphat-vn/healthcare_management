import { useGetDetailUserQuery } from "@/services/userApi";
import type { User } from "@/types/user.type";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Home,
  Check,
  Ban,
  User as UserIcon,
} from "lucide-react";
import ButtonBack from "@/components/ui/button/ButtonBack";

export default function UserDetail() {
  const { id } = useParams<{ _id?: string }>();
  const navigate = useNavigate();

  const {
    data: userDetailResponse,
    isLoading,
    isError,
    error,
  } = useGetDetailUserQuery({ id: id });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <div className="ml-4 text-lg text-gray-600">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="p-6 text-red-600">
        Error loading user:{" "}
        {(error as any)?.data?.message || (error as any)?.message}
      </div>
    );

  const user: User | undefined = userDetailResponse?.data;
  if (!user) return <div className="p-6 text-gray-500">User not found.</div>;

  // Determine status badge color and text
  const getStatusBadge = () => {
    if (user.status === 1) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <Check className="h-3 w-3" />
          Active
        </div>
      );
    } else if (user.status === 2) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <Ban className="h-3 w-3" />
          Banned
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <Ban className="h-3 w-3" />
          Inactive
        </div>
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      <ButtonBack title="User List" />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white/30">
              {getInitials(user.fullName)}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {user.fullName || "—"}
                  </h1>
                  <div className="text-indigo-100 mt-1 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    {user.roleName || "—"}
                  </div>
                </div>

                <div className="mt-2 md:mt-0">{getStatusBadge()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User details */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-800">
                      {user.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium text-gray-800">
                      {user.phoneNumber || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ID Card</div>
                    <div className="font-medium text-gray-800">
                      {user.identifyNumber || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-medium text-gray-800 capitalize">
                      {user.gender || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of Birth</div>
                    <div className="font-medium text-gray-800">
                      {user.dateOfBirth
                        ? new Date(user.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="font-medium text-gray-800">
                      {user.address || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System information */}
          <div className="mt-6 p-4 rounded-lg border border-gray-100 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              System Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500">Created At</div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Updated At</div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
