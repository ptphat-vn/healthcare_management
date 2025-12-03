import { useParams, useNavigate } from "react-router-dom";
import { useGetReagentByIdQuery } from "@/services/reagentApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Package,
  FlaskConical,
  FileText,
  Database,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

export default function ReagentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetReagentByIdQuery(id || "");
  const reagent = data?.data;

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | undefined;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 py-3 sm:py-4 border-b border-slate-100 last:border-0 min-w-0">
      <dt className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500 min-w-0">
        {label}
      </dt>
      <dd className="text-sm sm:text-base text-slate-900 font-medium wrap-break-word min-w-0">
        {value || <span className="text-slate-400 italic">Not provided</span>}
      </dd>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !reagent) {
    return (
      <div className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="mx-auto max-w-3xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600 font-medium">
                Error loading reagent details
              </p>
            </CardContent>
          </Card>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-2xl py-4 sm:py-6 px-2 overflow-x-hidden w-full">
      <div className="mx-auto w-full max-w-4xl flex flex-col gap-4 sm:gap-6 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-fit self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Reagent List</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 wrap-break-word">
                    {reagent.name}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Complete information about the reagent
                  </p>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${
                      reagent.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full mr-2 ${
                        reagent.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {reagent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Basic Information */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Basic Information
                </h2>
              </div>
              <dl className="space-y-0">
                <InfoRow label="Reagent Name" value={reagent.name} />
                <InfoRow label="Catalog Number" value={reagent.catalogNumber} />
                <InfoRow label="Manufacturer" value={reagent.manufacturer} />
                <InfoRow label="CAS Number" value={reagent.casNumber} />
                <InfoRow
                  label="Category"
                  value={
                    Array.isArray(reagent.categories)
                      ? reagent.categories.join(", ")
                      : reagent.categories
                  }
                />
              </dl>
            </CardContent>
          </Card>

          {/* Usage Information */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
                  <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Usage Information
                </h2>
              </div>
              <dl className="space-y-0">
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 py-3 sm:py-4 border-b border-slate-100 last:border-0 min-w-0">
                  <dt className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500 min-w-0">
                    Usage Per Run
                  </dt>
                  <dd className="text-sm sm:text-base text-slate-900 font-medium wrap-break-word min-w-0">
                    {reagent.usagePerRun ? (
                      `${reagent.usagePerRun.min} - ${reagent.usagePerRun.max} ${reagent.usagePerRun.unit}`
                    ) : (
                      <span className="text-slate-400 italic">
                        Not provided
                      </span>
                    )}
                  </dd>
                </div>
                <InfoRow label="Dilution Ratio" value={reagent.ratio} />
                <InfoRow
                  label="Storage Conditions"
                  value={
                    reagent.storageCondition
                      ? `${reagent.storageCondition} ºC`
                      : undefined
                  }
                />
              </dl>
            </CardContent>
          </Card>

          {/* Description */}
          {reagent.description && (
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Description
                  </h2>
                </div>
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <p className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap wrap-break-word">
                    {reagent.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg shadow-sm">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  System Information
                </h2>
              </div>
              <dl className="space-y-0">
                <InfoRow
                  label="Created At"
                  value={formatDate(reagent.createdAt)}
                />
                <InfoRow
                  label="Updated At"
                  value={formatDate(reagent.updatedAt)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3 sm:gap-4 py-3 sm:py-4 border-b border-slate-100 last:border-0 min-w-0">
                  <dt className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500 min-w-0">
                    Created By
                  </dt>
                  <dd className="text-sm sm:text-base text-slate-900 font-medium wrap-break-word min-w-0">
                    {reagent.createdByName || (
                      <span className="text-slate-400 italic">
                        Not provided
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
