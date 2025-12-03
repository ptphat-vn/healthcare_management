import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Users } from "lucide-react";
import InfoField from "./InfoField";

interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface EmergencyContactCardProps {
  emergencyContact: EmergencyContact;
}

export default function EmergencyContactCard({
  emergencyContact,
}: EmergencyContactCardProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 border-b border-yellow-100/50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4">
        <CardTitle className="flex items-center gap-2.5 sm:gap-3 text-yellow-700 min-w-0">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-sm shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold">
            Emergency Contact
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-5">
          <InfoField
            icon={User}
            label="Name"
            value={emergencyContact.name}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            hoverBgColor="hover:bg-yellow-50/50"
          />
          <InfoField
            icon={Phone}
            label="Phone Number"
            value={emergencyContact.phoneNumber}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            hoverBgColor="hover:bg-orange-50/50"
          />
          <InfoField
            icon={Users}
            label="Relationship"
            value={emergencyContact.relationship}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
            hoverBgColor="hover:bg-red-50/50"
          />
        </div>
      </CardContent>
    </Card>
  );
}
