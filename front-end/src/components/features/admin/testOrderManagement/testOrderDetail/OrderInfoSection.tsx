import { FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderInfoSectionProps {
  order: any;
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
    reviewed: "bg-indigo-100 text-indigo-800 border-indigo-200",
    ai_reviewed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN");
};

export default function OrderInfoSection({ order }: OrderInfoSectionProps) {
  return (
    <Card className="border-green-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <FileText className="w-6 h-6" />
          Order Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Status */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Status</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Created Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">Created</p>
            </div>
            <div className="ml-7 space-y-2">
              <div>
                <p className="text-xs text-blue-700">Date</p>
                <p className="font-semibold text-blue-900">
                  {formatDate(order.createdDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Created By</p>
                <p className="font-semibold text-blue-900">
                  {order.createdByUser?.fullName}
                </p>
                <p className="text-xs text-blue-600">
                  {order.createdByUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Run Info */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <p className="text-sm font-semibold text-purple-900">
                Test Executed
              </p>
            </div>
            <div className="ml-7 space-y-2">
              <div>
                <p className="text-xs text-purple-700">Date</p>
                <p className="font-semibold text-purple-900">
                  {formatDate(order.runDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Run By</p>
                <p className="font-semibold text-purple-900">
                  {order.runByUser?.fullName}
                </p>
                <p className="text-xs text-purple-600">
                  {order.runByUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Order ID */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Order ID</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {order._id}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
