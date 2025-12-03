import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientInfoSectionProps {
  order: any;
}

export default function PatientInfoSection({ order }: PatientInfoSectionProps) {
  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <User className="w-6 h-6" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Patient Name</p>
              <p className="font-semibold text-gray-900">{order.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.dateOfBirth).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Age</p>
              <p className="font-semibold text-gray-900">{order.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              <p className="font-semibold text-gray-900 capitalize">
                {order.gender}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{order.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-blue-600 text-sm break-all">
                {order.email}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Address</p>
            <p className="font-semibold text-gray-900">{order.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
