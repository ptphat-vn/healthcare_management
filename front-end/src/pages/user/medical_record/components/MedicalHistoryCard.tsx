import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";

interface MedicalHistory {
  allergies?: string[];
  chronicConditions?: string[];
  previousSurgeries?: string[];
}

interface MedicalHistoryCardProps {
  medicalHistory: MedicalHistory;
}

export default function MedicalHistoryCard({
  medicalHistory,
}: MedicalHistoryCardProps) {
  const renderBadges = (
    items: string[] | undefined,
    colorClass: string,
    bgClass: string
  ) => {
    if (!items || items.length === 0) {
      return (
        <span className="text-gray-400 italic text-sm">None</span>
      );
    }

    return (
      <>
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`${colorClass} ${bgClass} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-shadow`}
          >
            {item}
          </span>
        ))}
      </>
    );
  };

  return (
    <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-b border-red-100 px-4 py-3 sm:px-5 sm:py-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-red-700">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-md">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold">Medical History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Allergies
            </p>
            <div className="flex flex-wrap gap-2">
              {renderBadges(
                medicalHistory.allergies,
                "bg-gradient-to-r from-red-500 to-red-600",
                ""
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-yellow-50/50 border border-yellow-100 hover:bg-yellow-50 transition-colors">
            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Chronic Conditions
            </p>
            <div className="flex flex-wrap gap-2">
              {renderBadges(
                medicalHistory.chronicConditions,
                "bg-gradient-to-r from-yellow-500 to-amber-600",
                ""
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Previous Surgeries
            </p>
            <div className="flex flex-wrap gap-2">
              {renderBadges(
                medicalHistory.previousSurgeries,
                "bg-gradient-to-r from-blue-500 to-blue-600",
                ""
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

