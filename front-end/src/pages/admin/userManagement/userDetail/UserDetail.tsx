import { useGetDetailUserQuery } from "@/services/userApi";
import type { User } from "@/types/user.type";
import { useParams } from "react-router-dom";
import {
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
import { useState, useEffect } from "react";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [avatarError, setAvatarError] = useState(false);

  const {
    data: userDetailResponse,
    isLoading,
    isError,
    error,
  } = useGetDetailUserQuery({ id: id || "" }, { skip: !id });

  const user: User | undefined = userDetailResponse?.data;

  // Reset avatar error when user changes
  useEffect(() => {
    if (user?._id) {
      setAvatarError(false);
    }
  }, [user?._id]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <div className="text-sm md:text-lg text-gray-600 text-center">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );

  if (!id) {
    return (
      <div className="p-4 md:p-6 text-sm md:text-base text-red-600">
        User ID is missing. Please provide a valid user ID.
      </div>
    );
  }

  if (isError) {
    const err = error as { data?: { message?: string }; message?: string };
    const errMsg = err?.data?.message || err?.message || "Unknown error";
    return (
      <div className="p-4 md:p-6 text-sm md:text-base text-red-600">
        Error loading user: {errMsg}
      </div>
    );
  }

  if (!user)
    return (
      <div className="p-4 md:p-6 text-sm md:text-base text-gray-500">
        User not found.
      </div>
    );

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
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <ButtonBack title="User List" />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg border-2 sm:border-4 border-white/30 overflow-hidden mx-auto sm:mx-0">
              {user.avatar && !avatarError ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                getInitials(user.fullName)
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                    {user.fullName || "—"}
                  </h1>
                  <div className="text-indigo-100 mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="break-words">{user.roleName || "—"}</span>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 flex justify-center sm:justify-end">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User details */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Contact Information
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {user.email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {user.phoneNumber || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">ID Card</div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {user.identifyNumber || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Personal Information
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base capitalize">
                      {user.gender || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Date of Birth</div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base">
                      {user.dateOfBirth
                        ? new Date(user.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="font-medium text-gray-800 text-sm sm:text-base break-words">
                      {user.address || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System information */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border border-gray-100 bg-gray-50">
            <h2 className="text-sm sm:text-base font-medium text-gray-700 mb-3">
              System Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <div className="text-xs text-gray-500">Created At</div>
                <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 break-words">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Updated At</div>
                <div className="text-xs sm:text-sm font-medium text-gray-700 mt-1 break-words">
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
