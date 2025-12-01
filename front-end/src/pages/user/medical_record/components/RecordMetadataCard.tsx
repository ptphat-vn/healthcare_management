import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";
import InfoField from "./InfoField";

interface RecordMetadataCardProps {
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export default function RecordMetadataCard({
  createdAt,
  updatedAt,
  isDeleted,
}: RecordMetadataCardProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-gray-50 via-slate-50 to-zinc-50 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-700">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg shadow-md">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold">Record Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <InfoField
            icon={Clock}
            label="Created At"
            value={new Date(createdAt).toLocaleString()}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            hoverBgColor="hover:bg-blue-50/50"
            className="[&>div:last-child>p:last-child]:text-sm"
          />
          <InfoField
            icon={Clock}
            label="Updated At"
            value={new Date(updatedAt).toLocaleString()}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
            hoverBgColor="hover:bg-indigo-50/50"
            className="[&>div:last-child>p:last-child]:text-sm"
          />
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-yellow-50/50 transition-colors duration-200 group">
            <div
              className={`p-2 rounded-lg group-hover:opacity-80 transition-colors ${
                isDeleted ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 ${
                  isDeleted ? "text-red-600" : "text-green-600"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Status
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  isDeleted
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isDeleted ? "bg-red-500" : "bg-green-500"
                  } animate-pulse`}
                ></span>
                {isDeleted ? "Deleted" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

