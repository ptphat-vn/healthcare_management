import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Beaker,
  Calendar,
  PackageCheck,
  FileText,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetInstrumentReagentsQuery } from "@/services/instrumentApi";

export default function InstrumentReagentDetailPage() {
  const { instrumentId, assignmentId } = useParams<{ 
    instrumentId: string; 
    assignmentId: string;
  }>();
  const navigate = useNavigate();

  // Fetch all reagents for this instrument
  const { data, isLoading, error } = useGetInstrumentReagentsQuery(instrumentId || "");

  // Find the specific reagent assignment
  const reagentAssignment = data?.data?.reagents?.find(
    (r: any) => r._id === assignmentId
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExpirationStatus = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration < 0) {
      return {
        status: "Expired",
        color: "text-red-600",
        bg: "bg-red-100",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        status: "Expiring Soon",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    } else {
      return {
        status: "Valid",
        color: "text-green-600",
        bg: "bg-green-100",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
  };

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

  if (error || !reagentAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reagent Assignment Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The reagent assignment you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const expirationStatus = getExpirationStatus(reagentAssignment.expirationDate);

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-[20px]">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/service/instruments/${instrumentId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Instrument
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reagent Assignment Details
            </h1>
            <p className="text-gray-600">
              Information about {reagentAssignment.reagentName}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${expirationStatus.bg} ${expirationStatus.color}`}
          >
            {expirationStatus.icon}
            <span className="font-semibold">{expirationStatus.status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Reagent Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Beaker className="w-6 h-6 text-blue-600" />
              Reagent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reagent Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Beaker className="w-4 h-4" />
                  <span className="font-medium">Reagent Name</span>
                </div>
                <p className="text-gray-900 font-semibold text-lg">
                  {reagentAssignment.reagentName}
                </p>
              </div>

              {/* Lot Number */}
              {reagentAssignment.lotNumber && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Lot Number</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {reagentAssignment.lotNumber}
                  </p>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PackageCheck className="w-4 h-4" />
                  <span className="font-medium">Quantity</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {reagentAssignment.quantity} {reagentAssignment.unitOfMeasure}
                </p>
              </div>

              {/* Unit of Measure */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Unit of Measure</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {reagentAssignment.unitOfMeasure}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
              Date Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expiration Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Expiration Date</span>
                </div>
                <p className={`font-semibold ${expirationStatus.color}`}>
                  {formatDate(reagentAssignment.expirationDate)}
                </p>
              </div>

              {/* Assigned Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Assigned Date</span>
                </div>
                <p className="text-gray-900">
                  {formatDateTime(reagentAssignment.assignedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instrument Information Card */}
        {data?.data?.instrument && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="w-6 h-6 text-green-600" />
                Assigned to Instrument
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instrument Name */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">Instrument Name</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {data.data.instrument.name}
                  </p>
                </div>

                {/* Model */}
                {data.data.instrument.model && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Model</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {data.data.instrument.model}
                    </p>
                  </div>
                )}

                {/* Serial Number */}
                {data.data.instrument.serialNumber && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Serial Number</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {data.data.instrument.serialNumber}
                    </p>
                  </div>
                )}

                {/* Location */}
                {data.data.instrument.location && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Activity className="w-4 h-4" />
                      <span className="font-medium">Location</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {data.data.instrument.location}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
