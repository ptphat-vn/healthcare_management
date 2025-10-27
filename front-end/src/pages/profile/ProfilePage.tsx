import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/baseApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { EditAdminForm } from "@/components/features/admin/profileManagement/EditAdminForm";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const user = profileData?.data;
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Role display mapping
  const getRoleDisplay = (roleCode?: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      admin: { label: "Administrator", color: "bg-red-500" },
      manager: { label: "Manager", color: "bg-purple-500" },
      lab_user: { label: "Lab Technician", color: "bg-blue-500" },
      service: { label: "Service Staff", color: "bg-green-500" },
      consultant: { label: "Consultant", color: "bg-orange-500" },
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

  return (
    <div className="min-h-screen bg-gray-50 p-5 min-w-[900px] max-w-[1200px] mx-auto ">
      <div className="max-w-6xl mx-auto ">
        {/* Main Profile Card */}
        <Card className="mb-6 ">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center ml-5">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-4">
                  <User className="w-16 h-16 " />
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-20 mt-25 mr-5"
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
