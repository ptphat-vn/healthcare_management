import { useParams, useNavigate } from "react-router-dom";
import { useGetReagentByIdQuery } from "@/services/reagentApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-3">
      <dt className="font-semibold text-gray-600">{label}</dt>
      <dd className="sm:col-span-2 text-gray-900 break-words">
        {value || "N/A"}
      </dd>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !reagent) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading reagent details</p>
        </div>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-3xl px-4 sm:px-6 py-6 rounded-[20px]">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reagent List
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reagent Details
              </h1>
              <p className="text-gray-600">
                Complete information about the reagent
              </p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border self-start sm:self-auto ${
                reagent.isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {reagent.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
              <div className="h-1 w-1 rounded-full bg-blue-600 mr-2"></div>
              Basic Information
            </h2>
            <dl className="divide-y divide-gray-200">
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
          </div>

          <hr className="border-gray-200" />

          {/* Usage Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
              <div className="h-1 w-1 rounded-full bg-blue-600 mr-2"></div>
              Usage Information
            </h2>
            <dl className="divide-y divide-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-3">
                <dt className="font-semibold text-gray-600">Usage Per Run</dt>
                <dd className="sm:col-span-2 text-gray-900">
                  {reagent.usagePerRun
                    ? `${reagent.usagePerRun.min} - ${reagent.usagePerRun.max} ${reagent.usagePerRun.unit}`
                    : "N/A"}
                </dd>
              </div>
              <InfoRow label="Dilution Ratio" value={reagent.ratio} />
              <InfoRow
                label="Storage Conditions"
                value={reagent.storageCondition + " ºC"}
              />
            </dl>
          </div>

          <hr className="border-gray-200" />

          {/* Description */}
          {reagent.description && (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
                  <div className="h-1 w-1 rounded-full bg-blue-600 mr-2"></div>
                  Description
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {reagent.description}
                  </p>
                </div>
              </div>
              <hr className="border-gray-200" />
            </>
          )}

          {/* System Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
              <div className="h-1 w-1 rounded-full bg-blue-600 mr-2"></div>
              System Information
            </h2>
            <dl className="divide-y divide-gray-200">
              <InfoRow
                label="Created At"
                value={formatDate(reagent.createdAt)}
              />
              <InfoRow
                label="Updated At"
                value={formatDate(reagent.updatedAt)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-3">
                <dt className="font-semibold text-gray-600">Created By</dt>
                <dd className="sm:col-span-2 text-gray-900 break-words">
                  {typeof reagent.createdBy === "string"
                    ? reagent.createdBy
                    : reagent.createdBy?.fullName || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
