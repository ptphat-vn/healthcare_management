import { useParams, useNavigate } from "react-router-dom";
import {
  useGetInstrumentByIdQuery,
  useGetInstrumentReagentsQuery,
  useRemoveReagentFromInstrumentMutation,
} from "@/services/instrumentApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Activity,
  Calendar,
  MapPin,
  Package,
  Settings,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Beaker,
  Tag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AddReagentDialog from "@/components/features/service/reagentInstrument/addReagentDialog/AddReagentDialog";
import ReagentsTable from "@/components/features/service/reagentInstrument/reagentsTable/ReagentsTable";

export default function InstrumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetInstrumentByIdQuery(id || "");
  const {
    data: reagentsData,
    isLoading: isLoadingReagents,
    refetch: refetchReagents,
  } = useGetInstrumentReagentsQuery(id || "");
  const [removeReagent] = useRemoveReagentFromInstrumentMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <Skeleton className="h-8 sm:h-10 w-40 sm:w-48 md:w-64" />
          <Skeleton className="h-64 sm:h-80 md:h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <XCircle className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-red-500" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Instrument Not Found
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                The instrument you're looking for doesn't exist or has been
                removed.
              </p>
              <Button 
                onClick={() => navigate("/service/instruments")}
                className="w-full sm:w-auto"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Instruments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const instrument = data.data;
  const reagentsResponse = reagentsData?.data;
  const reagents = Array.isArray(reagentsResponse?.reagents)
    ? reagentsResponse?.reagents
    : [];

  const handleDeleteReagent = async (assignmentId: string) => {
    try {
      await removeReagent(assignmentId).unwrap();
      toast.success("Reagent removed successfully");
      refetchReagents();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove reagent");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      Inactive: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: <XCircle className="w-4 h-4" />,
      },
      Maintenance: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
      },
      "Out of Service": {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const style = styles[status as keyof typeof styles] || styles.Inactive;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${style.bg} ${style.text}`}
      >
        {style.icon}
        <span className="font-semibold text-xs sm:text-sm">{status}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-2 sm:mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/service/instruments")}
            className="mb-3 sm:mb-4 w-full sm:w-auto"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Instrument List</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                Instrument Details
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words">
                Complete information about {instrument.name}
              </p>
            </div>
            <div className="flex-shrink-0 self-start sm:self-center">
              {getStatusBadge(instrument.status)}
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <Card>
          <CardHeader className="px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
              <span className="break-words">General Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Instrument Name</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                  {instrument.name}
                </p>
              </div>

              {/* Model */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Model</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                  {instrument.model || "N/A"}
                </p>
              </div>

              {/* Manufacturer */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Manufacturer</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                  {instrument.manufacturer || "N/A"}
                </p>
              </div>

              {/* Serial Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Serial Number</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                  {instrument.serialNumber || "N/A"}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                  {instrument.location || "N/A"}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Status</span>
                </div>
                <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                  {instrument.status}
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Categories</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {instrument.categories && instrument.categories.length > 0 ? (
                    instrument.categories.map(
                      (category: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full break-words"
                        >
                          {category}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-gray-500 text-xs sm:text-sm">
                      No categories assigned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {instrument.description && (
              <div className="mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 md:pt-6 border-t">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Description</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
                  {instrument.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata Card */}
        <Card>
          <CardHeader className="px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
              <span className="break-words">System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Created At */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Created At</span>
                </div>
                <p className="text-gray-900">
                  {instrument.createdAt
                    ? formatDate(instrument.createdAt)
                    : "N/A"}
                </p>
              </div>

              {/* Updated At */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Last Updated</span>
                </div>
                <p className="text-gray-900">
                  {instrument.updatedAt
                    ? formatDate(instrument.updatedAt)
                    : "N/A"}
                </p>
              </div>

              {/* Created By */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Created By</span>
                </div>
                <p className="text-gray-900 text-sm sm:text-base break-words">
                  {instrument.createdByName || "N/A"}
                </p>
              </div>

              {/* Last Modified By */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-medium">Last Modified By</span>
                </div>
                <p className="text-gray-900 text-sm sm:text-base break-words">
                  {instrument.lastModifiedByName || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reagent Management Card */}
        <Card>
          <CardHeader className="px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <Beaker className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                <span className="break-words">
                  Assigned Reagents ({reagents?.length})
                </span>
              </CardTitle>
              <div className="w-full sm:w-auto flex-shrink-0">
                <AddReagentDialog
                  instrumentId={id || ""}
                  onSuccess={refetchReagents}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {isLoadingReagents ? (
              <div className="text-center py-6 sm:py-8">
                <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-2 text-gray-600 text-xs sm:text-sm md:text-base">
                  Loading reagents...
                </p>
              </div>
            ) : reagents?.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 px-4">
                <Beaker className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <p className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-2">
                  No reagents assigned
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  This instrument doesn't have any reagents assigned yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                <ReagentsTable
                  instrumentId={id || ""}
                  reagents={reagents || []}
                  onDelete={handleDeleteReagent}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
