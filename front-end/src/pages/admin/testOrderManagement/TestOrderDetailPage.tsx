import CommentsSection from "@/components/features/admin/testOrderManagement/testOrderDetail/CommentsSection";
import OrderInfoSection from "@/components/features/admin/testOrderManagement/testOrderDetail/OrderInfoSection";
import PatientInfoSection from "@/components/features/admin/testOrderManagement/testOrderDetail/PatientInfoSection";
import TestResultsSection from "@/components/features/admin/testOrderManagement/testOrderDetail/TestResultsSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetDetailTestOrderQuery } from "@/services/testOrderApi";

type Tab = "overview" | "results" | "comments";

export default function TestOrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data, isLoading, error } = useGetDetailTestOrderQuery({
    id: orderId || "",
  });

  const order = data?.data;
  console.log(order);
  console.log(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading test order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/test-order")}
            className="btn-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Test Orders
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Order Not Found
            </h2>
            <p className="text-red-600 mb-4">
              {error
                ? "Failed to load test order details"
                : "The test order you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate("/admin/test-order")}>
              Back to Test Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/test-order")}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Test Orders
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Test Order Details
            </h1>
            <p className="text-gray-600">
              Order ID:{" "}
              <span className="font-mono font-semibold">{order._id}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white rounded-t-lg shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${
                activeTab === "overview"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${
                activeTab === "results"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Test Results ({order.testResults?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${
                activeTab === "comments"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Comments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg p-6 shadow-sm">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PatientInfoSection order={order} />
              <OrderInfoSection order={order} />
            </div>
          )}

          {activeTab === "results" && (
            <TestResultsSection testResults={order.testResults || []} />
          )}

          {activeTab === "comments" && (
            <CommentsSection
              comments={order.comments || []}
              testOrderId={orderId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
