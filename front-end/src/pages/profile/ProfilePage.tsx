import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/baseApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, AlertCircle, Pencil } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { EditAdminForm } from "@/components/features/admin/profileManagement/EditAdminFrom/EditAdminForm";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useUpdateAvatarMutation } from "@/services/userApi";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

export default function ProfilePage() {
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const user = profileData?.data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAvatarEdit, setIsAvatarEdit] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateAvatar] = useUpdateAvatarMutation();
  console.log(isAvatarEdit);

  // Role display mapping
  const getRoleDisplay = (roleCode?: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      admin: {
        label: "Administrator",
        color: "bg-red-500",
      },
      lab_manager: {
        label: "Lab Manager",
        color: "bg-teal-500",
      },
      lab_user: {
        label: "Lab Technician",
        color: "bg-emerald-500",
      },
      service: {
        label: "Service Staff",
        color: "bg-amber-500",
      },
      consultant: {
        label: "Consultant",
        color: "bg-orange-500",
      },
      patient: {
        label: "Patient",
        color: "bg-rose-500",
      },
    };
    return (
      roleMap[roleCode || ""] || {
        label: roleCode || "Staff",
        color: "bg-gray-500",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load profile</p>
        </div>
      </div>
    );
  }

  const roleDisplay = getRoleDisplay(user.roleCode);

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
      setIsAvatarEdit(true);
      try {
        await updateAvatar(file).unwrap();
        toast.success("Avatar updated successfully!");
        setIsAvatarEdit(false);
      } catch (error: unknown) {
        toast.error("Failed to update avatar. Please try again.");
        console.log(error);
        setIsAvatarEdit(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 min-w-[900px] max-w-[1200px] mx-auto ">
      <div className="max-w-6xl mx-auto ">
        {/* Main Profile Card */}
        <Card className="mb-6 ">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center ml-5">
                <div className="relative w-32 h-32 mb-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow"
                    />
                  ) : user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="cursor-pointer absolute bottom-1 right-1 bg-white/80 hover:bg-blue-500 hover:text-white text-blue-600 rounded-full p-2 shadow transition-all border border-blue-200"
                    title="Edit avatar"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.fullName}
                </h2>
                <p className="text-sm text-gray-500">
                  {calculateAge(user.dateOfBirth)} yrs |{" "}
                  {user.gender === "male" ? "Male" : "Female"}
                </p>
                <Badge
                  className={`mt-2 ${roleDisplay.color} hover:${roleDisplay.color} cursor-default`}
                >
                  {roleDisplay.label}
                </Badge>
              </div>

              {/* THANH GẠCH DỌC */}
              <div className="h-60 border-1 border-gray-150 ml-10"></div>

              {/* Personal Information */}
              <div className="flex-1 space-y-4 ml-10">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-850 w-40">
                    Email
                  </p>
                  <p className="text-gray-900 flex-1">{user.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-850 w-40">
                    Phone number
                  </p>
                  <p className="text-gray-900 flex-1">{user.phoneNumber}</p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-850 w-40">
                    Identify Number
                  </p>
                  <p className="text-gray-900 flex-1">{user.identifyNumber}</p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-850 w-40">
                    Date of Birth
                  </p>
                  <p className="text-gray-900 flex-1">
                    {formatDate(user.dateOfBirth)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-850 w-40">
                    Gender
                  </p>
                  <p className="text-gray-900 flex-1">
                    {user.gender === "male" ? "Male" : "Female"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-gray-850 w-40">
                    Address
                  </p>
                  <p className="text-gray-900 flex-1">
                    {user.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* THANH GẠCH DỌC */}
              <div className="h-60 border-1 border-gray-150 mr-5"></div>

              {/* Edit Button */}
              <div className="flex items-start">
                <Button
                  onClick={() => setIsEditOpen(true)}
                  className={`${getRoleButtonClass(
                    user?.roleCode
                  )} px-20 mt-25 mr-5`}
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
