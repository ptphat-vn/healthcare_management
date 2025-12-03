import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, IdCard, CalendarDays } from "lucide-react";
import InfoField from "./InfoField";

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  expiryDate?: string;
}

interface InsuranceInfoCardProps {
  insuranceInfo: InsuranceInfo;
}

export default function InsuranceInfoCard({
  insuranceInfo,
}: InsuranceInfoCardProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-100/50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4">
        <CardTitle className="flex items-center gap-2.5 sm:gap-3 text-green-700 min-w-0">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold">
            Insurance Information
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-5">
          <InfoField
            icon={Shield}
            label="Provider"
            value={insuranceInfo.provider}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            hoverBgColor="hover:bg-green-50/50"
          />
          <InfoField
            icon={IdCard}
            label="Policy Number"
            value={insuranceInfo.policyNumber}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            hoverBgColor="hover:bg-emerald-50/50"
          />
          {insuranceInfo.expiryDate && (
            <InfoField
              icon={CalendarDays}
              label="Expiry Date"
              value={insuranceInfo.expiryDate}
              iconColor="text-teal-600"
              iconBgColor="bg-teal-100"
              hoverBgColor="hover:bg-teal-50/50"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
