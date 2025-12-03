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
        <span className="text-slate-400 italic text-xs sm:text-sm font-medium">
          None
        </span>
      );
    }

    return (
      <>
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`${colorClass} ${bgClass} text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 break-words whitespace-normal inline-block max-w-full`}
          >
            {item}
          </span>
        ))}
      </>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-b border-red-100/50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4">
        <CardTitle className="flex items-center gap-2.5 sm:gap-3 text-red-700 min-w-0">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-sm shrink-0">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-bold">
            Medical History
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-red-50/80 to-red-50/40 border border-red-100/60 hover:from-red-50 hover:to-red-100/50 transition-all duration-200 min-w-0 max-w-full overflow-hidden">
            <p className="text-xs sm:text-sm font-bold text-red-700 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
              Allergies
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-2.5 min-w-0 w-full">
              {renderBadges(
                medicalHistory.allergies,
                "bg-gradient-to-r from-red-500 to-red-600",
                ""
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-yellow-50/80 to-yellow-50/40 border border-yellow-100/60 hover:from-yellow-50 hover:to-yellow-100/50 transition-all duration-200 min-w-0 max-w-full overflow-hidden">
            <p className="text-xs sm:text-sm font-bold text-yellow-700 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full shrink-0"></span>
              Chronic Conditions
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-2.5 min-w-0 w-full">
              {renderBadges(
                medicalHistory.chronicConditions,
                "bg-gradient-to-r from-yellow-500 to-amber-600",
                ""
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-50/40 border border-blue-100/60 hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200 min-w-0 max-w-full overflow-hidden">
            <p className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></span>
              Previous Surgeries
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-2.5 min-w-0 w-full">
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
