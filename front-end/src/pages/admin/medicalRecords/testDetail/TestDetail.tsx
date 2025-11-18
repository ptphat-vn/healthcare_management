import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { useState } from "react";

type Tab = "overview" | "results";

// Fake data for Test History
interface TestHistory {
  id: string;
  testType: string;
  testDate: string;
  status: "Complete" | "In Progress" | "Pending" | "Review";
  priority: "NORMAL" | "URGENT";
  performedBy: string;
  results?: string;
}

const fakeTestHistory: TestHistory[] = [
  {
    id: "TH-001234",
    testType: "Complete Blood Count",
    testDate: "2024-01-15",
    status: "Complete",
    priority: "NORMAL",
    performedBy: "Lab Tech Mike",
    results: "Normal",
  },
  {
    id: "TH-001235",
    testType: "Lipid Panel",
    testDate: "2024-01-10",
    status: "Complete",
    priority: "NORMAL",
    performedBy: "Lab Tech Sarah",
    results: "High Cholesterol",
  },
  {
    id: "TH-001236",
    testType: "Thyroid Function",
    testDate: "2024-01-05",
    status: "In Progress",
    priority: "URGENT",
    performedBy: "Lab Tech John",
  },
  {
    id: "TH-001237",
    testType: "Blood Glucose",
    testDate: "2024-01-01",
    status: "Review",
    priority: "NORMAL",
    performedBy: "Lab Tech Mike",
    results: "Elevated",
  },
];

export default function TestDetail() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Find test from fake data
  const test = fakeTestHistory.find((t) => t.id === testId);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | undefined;
  }) => (
    <div className="flex justify-between py-3 border-b border-gray-200">
      <dt className="font-semibold text-gray-600">{label}</dt>
      <dd className="text-gray-900">{value || "N/A"}</dd>
    </div>
  );

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">
              Test Not Found
            </h2>
            <p className="text-yellow-600 mb-4">
              The test you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(-1)}>Back to Medical Record</Button>
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Medical Record
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Test Details
            </h1>
            <p className="text-gray-600">
              Test ID:{" "}
              <span className="font-mono font-semibold">{test.id}</span>
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
              Test Results
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg p-6 shadow-sm">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  Test Information
                </h2>
                <dl className="space-y-3">
                  <InfoRow label="Test ID" value={test.id} />
                  <InfoRow label="Test Type" value={test.testType} />
                  <InfoRow
                    label="Test Date"
                    value={new Date(test.testDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <dt className="font-semibold text-gray-600">Priority</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          test.priority === "URGENT"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {test.priority}
                      </span>
                    </dd>
                  </div>
                  <InfoRow label="Performed By" value={test.performedBy} />
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <dt className="font-semibold text-gray-600">Status</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          test.status === "Complete"
                            ? "bg-green-100 text-green-800"
                            : test.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : test.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {test.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  Additional Information
                </h2>
                <dl className="space-y-3">
                  <div className="py-3 border-b border-gray-200">
                    <dt className="font-semibold text-gray-600 mb-2">Notes</dt>
                    <dd className="text-gray-900">
                      No additional notes available
                    </dd>
                  </div>
                  <div className="py-3 border-b border-gray-200">
                    <dt className="font-semibold text-gray-600 mb-2">
                      Comments
                    </dt>
                    <dd className="text-gray-900">No comments</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === "results" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                Test Results
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                {test.results ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Result: {test.results}
                    </p>
                    <p className="text-gray-600">
                      The test has been completed and results are available.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                      Results not available yet
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Test is still {test.status.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
