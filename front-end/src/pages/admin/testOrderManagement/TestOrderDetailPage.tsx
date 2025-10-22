import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileText } from "lucide-react";
import type { TestOrder } from "@/components/features/admin/testOrderManagement/TestOrderList";

// Fake data (trong thực tế sẽ fetch từ API theo ID)
const fakeTestOrders: TestOrder[] = [
  {
    id: "TO-001234",
    patientName: "John Doe",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Male",
    testType: "Complete Blood Count",
    priority: "NORMAL",
    createdBy: "Dr. Smith",
    createdOn: "9/10/2025",
    status: "Complete",
  },
  {
    id: "TO-001235",
    patientName: "Jane Smith",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Female",
    testType: "Lipid Panel",
    priority: "URGENT",
    createdBy: "Dr.Wilson",
    createdOn: "9/11/2025",
    status: "In Progress",
  },
  {
    id: "TO-001236",
    patientName: "John Doe",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Male",
    testType: "Thyroid Function",
    priority: "NORMAL",
    createdBy: "Dr. Smith",
    createdOn: "9/9/2025",
    status: "Pending",
  },
  {
    id: "TO-001237",
    patientName: "Jane Smith",
    patientDob: "1985-03-15",
    age: 49,
    gender: "Female",
    testType: "Thyroid Function",
    priority: "URGENT",
    createdBy: "Dr.Wilson",
    createdOn: "9/12/2025",
    status: "Review",
  },
];

export default function TestOrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "results">("overview");

  // Tìm order theo ID
  const order = fakeTestOrders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Button onClick={() => navigate("/admin/test-order")}>
            Back to Test Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/test-order")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Test Orders
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Test Order Details - {order.id}</h1>
        <p className="text-gray-600">View and manage test order information</p>
      </div>

      <div className="border-b mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${
              activeTab === "overview"
                ? "text-gray-900 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-3 px-6 text-base font-semibold transition-colors border-b-2 ${
              activeTab === "results"
                ? "text-gray-900 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }`}
          >
            Test Results
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-6 w-6" />
              <h2 className="text-xl font-bold">Patient Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Patient ID</p>
                  <p className="font-semibold text-gray-900">#TRUST0331</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{order.patientName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="font-semibold text-gray-900">{order.patientDob}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gender</p>
                  <p className="font-semibold text-gray-900">{order.gender}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">0928383598</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-blue-600 underline">yenn41234@gmail.com</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-semibold text-gray-900">TPHCM</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6" />
              <h2 className="text-xl font-bold">Order Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Test Type</p>
                  <p className="font-semibold text-gray-900">{order.testType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created By</p>
                  <p className="font-semibold text-gray-900">{order.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created Date</p>
                  <p className="font-semibold text-gray-900">{order.createdOn}, 09:15:30</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Performed By</p>
                  <p className="font-semibold text-gray-900">Lab Tech Mike</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Performed Date</p>
                  <p className="font-semibold text-gray-900">{order.createdOn}, 09:15:30</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reviewed By</p>
                  <p className="font-semibold text-gray-900">Dr. Sarah Johnson</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reviewed Date</p>
                  <p className="font-semibold text-gray-900">{order.createdOn}, 09:15:30</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "Complete"
                        ? "bg-green-100 text-green-700"
                        : order.status === "In Progress"
                        ? "bg-red-100 text-red-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      order.priority === "URGENT"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.priority}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <div className="bg-gray-200 rounded-md p-3">
                  <p className="text-gray-900">Patient fasted for 12 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Test Results</h2>
          <div className="text-center text-gray-500 py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Test results will be displayed here</p>
            <p className="text-sm mt-2">Once the test is completed and reviewed</p>
          </div>
        </div>
      )}
    </div>
  );
}
