import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { User, FileText } from "lucide-react";
import type { TestOrder } from "./TestOrderList";

interface TestOrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TestOrder | null;
}

export default function TestOrderDetailModal({
  open,
  onOpenChange,
  order,
}: TestOrderDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "results">("overview");

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-white text-gray-900 border-b-2 border-blue-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
              activeTab === "results"
                ? "bg-white text-gray-900 border-b-2 border-blue-600"
                : "bg-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Test Results
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
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
      </DialogContent>
    </Dialog>
  );
}
