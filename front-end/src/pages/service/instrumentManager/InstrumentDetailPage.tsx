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
  const [removeReagent] =
    useRemoveReagentFromInstrumentMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Instrument Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The instrument you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => navigate("/service/instruments")}>
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
    ? reagentsResponse.reagents 
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
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${style.bg} ${style.text}`}
      >
        {style.icon}
        <span className="font-semibold">{status}</span>
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
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/service/instruments")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Instrument List
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Instrument Details
            </h1>
            <p className="text-gray-600">
              Complete information about {instrument.name}
            </p>
          </div>
          {getStatusBadge(instrument.status)}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="w-6 h-6 text-blue-600" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Instrument Name</span>
                </div>
                <p className="text-gray-900 font-semibold">{instrument.name}</p>
              </div>

              {/* Model */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Model</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {instrument.model || "N/A"}
                </p>
              </div>

              {/* Manufacturer */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Manufacturer</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {instrument.manufacturer || "N/A"}
                </p>
              </div>

              {/* Serial Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Serial Number</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {instrument.serialNumber || "N/A"}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {instrument.location || "N/A"}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Status</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {instrument.status}
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {instrument.categories && instrument.categories.length > 0 ? (
                    instrument.categories.map((category: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {category}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No categories assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {instrument.description && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Description</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {instrument.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-6 h-6 text-purple-600" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Created At */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Created At</span>
                </div>
                <p className="text-gray-900">
                  {formatDate(instrument.createdAt)}
                </p>
              </div>

              {/* Updated At */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Last Updated</span>
                </div>
                <p className="text-gray-900">
                  {formatDate(instrument.updatedAt)}
                </p>
              </div>

              {/* Created By */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Created By</span>
                </div>
                <p className="text-gray-900">{instrument.createdByName || "N/A"}</p>
              </div>

              {/* Last Modified By */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Last Modified By</span>
                </div>
                <p className="text-gray-900">
                  {instrument.lastModifiedByName || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reagent Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Beaker className="w-6 h-6 text-green-600" />
                Assigned Reagents ({reagents.length})
              </CardTitle>
              <AddReagentDialog 
                instrumentId={id || ""} 
                onSuccess={refetchReagents}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingReagents ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-gray-600">Loading reagents...</p>
              </div>
            ) : reagents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Beaker className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium mb-2">No reagents assigned</p>
                <p className="text-sm text-gray-500">
                  This instrument doesn't have any reagents assigned yet.
                </p>
              </div>
            ) : (
              <ReagentsTable
                instrumentId={id || ""}
                reagents={reagents}
                onDelete={handleDeleteReagent}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}