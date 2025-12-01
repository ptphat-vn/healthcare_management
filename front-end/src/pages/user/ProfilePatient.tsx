import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/baseApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Home,
  User as UserIcon,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { EditAdminForm } from "@/components/features/admin/profileManagement/EditAdminFrom/EditAdminForm";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useUpdateAvatarMutation } from "@/services/userApi";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

export default function ProfilePatient() {
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const user = profileData?.data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateAvatar] = useUpdateAvatarMutation();

  // Reset avatar error when user changes
  useEffect(() => {
    if (user?._id) {
      setAvatarError(false);
    }
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?._id, user?.avatar]);

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
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

  // Handle avatar change
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      try {
        await updateAvatar(file).unwrap();
        toast.success("Avatar updated successfully!");
        // Dispatch event to notify Header to refetch
        window.dispatchEvent(new CustomEvent("avatarUpdated"));
      } catch (error: unknown) {
        toast.error("Failed to update avatar. Please try again.");
        console.log(error);
        setAvatarPreview(user?.avatar || null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-600">
            Unable to load profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-5 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4">
                  {avatarPreview && !avatarError ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-blue-400 shadow"
                      onError={() => setAvatarError(true)}
                    />
                  ) : user.avatar && !avatarError ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-blue-400 shadow"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="cursor-pointer absolute bottom-0 right-0 bg-white/80 hover:bg-blue-500 hover:text-white text-blue-600 rounded-full p-1.5 sm:p-2 shadow transition-all border border-blue-200"
                    title="Edit avatar"
                  >
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center">
                  {user.fullName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 text-center mt-1">
                  {calculateAge(user.dateOfBirth)} yrs |{" "}
                  {user.gender === "male" ? "Male" : "Female"}
                </p>
              </div>

              {/* Divider - Hidden on mobile */}
              <div className="hidden lg:block h-auto w-px bg-gray-200"></div>

              {/* Personal Information */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Email
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 break-words">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Phone number
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 break-words">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Identify Number
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 break-words">
                        {user.identifyNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Date of Birth
                      </p>
                      <p className="text-sm sm:text-base text-gray-900">
                        {formatDate(user.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Gender
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 capitalize">
                        {user.gender === "male" ? "Male" : "Female"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-500">
                        Address
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 break-words">
                        {user.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider - Hidden on mobile */}
              <div className="hidden lg:block h-auto w-px bg-gray-200"></div>

              {/* Edit Button */}
              <div className="flex items-start justify-center lg:justify-start">
                <Button
                  onClick={() => setIsEditOpen(true)}
                  className={`${getRoleButtonClass(
                    user?.roleCode
                  )} w-full sm:w-auto px-8 sm:px-20`}
                >
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form Modal */}
      {isEditOpen && user && (
        <EditAdminForm
          defaultValues={user}
          onClose={() => setIsEditOpen(false)}
          isLoading={isUpdating}
          onSubmit={async (data) => {
            try {
              const updateData = {
                fullName: data.fullName,
                email: data.email,
                phoneNumber: (data as { phone?: string }).phone || "",
                identifyNumber: data.identifyNumber,
                dateOfBirth: data.dateOfBirth,
                gender: (data.gender?.toLowerCase() || "male") as
                  | "male"
                  | "female",
                address: data.address || "",
                avatar: avatarPreview || user.avatar || "",
              };
              await updateProfile(updateData).unwrap();
              toast.success("Profile updated successfully!");
              setIsEditOpen(false);
            } catch (error) {
              toast.error("Failed to update profile. Please try again.");
              console.error("Update error:", error);
            }
          }}
        />
      )}
    </div>
  );
}
