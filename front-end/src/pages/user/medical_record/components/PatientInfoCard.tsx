import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Mail,
  CalendarDays,
  Home,
  IdCard,
  HeartPulse,
  Shield,
} from "lucide-react";
import InfoField from "./InfoField";

interface Patient {
  _id?: string;
  fullName: string;
  dateOfBirth: string;
  gender: string | 'male' | 'female';
  bloodType?: string;
  identifyNumber?: string;
  phoneNumber: string;
  email?: string;
  address: string;
}

interface PatientInfoCardProps {
  patient: Patient;
  calculateAge: (dob: string) => number;
}

export default function PatientInfoCard({
  patient,
  calculateAge,
}: PatientInfoCardProps) {
  return (
    <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100 px-4 py-3 sm:px-5 sm:py-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-blue-700">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold">Patient Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {patient._id && (
            <InfoField
              icon={IdCard}
              label="Patient ID"
              value={patient._id}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
              hoverBgColor="hover:bg-blue-50/50"
            />
          )}
          <InfoField
            icon={User}
            label="Full Name"
            value={patient.fullName}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
            hoverBgColor="hover:bg-indigo-50/50"
          />
          <InfoField
            icon={CalendarDays}
            label="Date of Birth"
            value={`${patient.dateOfBirth} (${calculateAge(patient.dateOfBirth)} years)`}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-100"
            hoverBgColor="hover:bg-pink-50/50"
            className="[&>div:last-child>p:last-child]:text-pink-600 [&>div:last-child>p:last-child]:font-normal"
          />
          <InfoField
            icon={Shield}
            label="Gender"
            value={patient.gender}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            hoverBgColor="hover:bg-green-50/50"
            className="[&>div:last-child>p:last-child]:capitalize"
          />
          {patient.bloodType && (
            <InfoField
              icon={HeartPulse}
              label="Blood Type"
              value={patient.bloodType}
              iconColor="text-red-600"
              iconBgColor="bg-red-100"
              hoverBgColor="hover:bg-red-50/50"
            />
          )}
          {patient.identifyNumber && (
            <InfoField
              icon={IdCard}
              label="ID Number"
              value={patient.identifyNumber}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
              hoverBgColor="hover:bg-purple-50/50"
            />
          )}
          <InfoField
            icon={Phone}
            label="Phone Number"
            value={patient.phoneNumber}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            hoverBgColor="hover:bg-blue-50/50"
          />
          {patient.email && (
            <InfoField
              icon={Mail}
              label="Email"
              value={patient.email}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
              hoverBgColor="hover:bg-indigo-50/50"
            />
          )}
          <InfoField
            icon={Home}
            label="Address"
            value={patient.address}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            hoverBgColor="hover:bg-green-50/50"
          />
        </div>
      </CardContent>
    </Card>
  );
}

