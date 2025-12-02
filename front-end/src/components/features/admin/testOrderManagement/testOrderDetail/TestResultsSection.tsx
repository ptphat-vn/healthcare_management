import { TrendingUp, AlertTriangle, Plus, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddTestResultModal from "./AddTestResultModal";
import CommentsSection from "./CommentsSection";
import { useCreateTestOrderReviewByAIMutation } from "@/services/testOrderApi";
import { toast } from "sonner";

interface TestResult {
  _id: string;
  testName: string;
  result: string;
  unit: string;
  normalRange: string;
  status: string;
  flag: string;
  hl7MessageId: string;
  processedData?: {
    originalFlag: string;
    processingTimestamp: string;
    configApplied: string | null;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  modifiedBy?: string;
  isDeleted: boolean;
}

interface TestResultsSectionProps {
  testResults: TestResult[];
  testOrderId: string;
  comments: Comment[];
}

const getResultStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: "bg-green-100 text-green-800 border-green-200",
    abnormal: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getFlagBadge = (flag: string) => {
  const flagMap: Record<string, string> = {
    H: "bg-red-100 text-red-800",
    L: "bg-blue-100 text-blue-800",
    "": "bg-gray-100 text-gray-800",
  };
  return flagMap[flag] || "bg-gray-100 text-gray-800";
};

export default function TestResultsSection({
  testResults,
  testOrderId,
  comments,
}: TestResultsSectionProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [aiReviewTestOrd, { isLoading }] =
    useCreateTestOrderReviewByAIMutation();
  const handleAddTestResult = () => {
    setAddModalOpen(true);
  };

  const handleAIReviewTestResult = async () => {
    try {
      const response = await aiReviewTestOrd({ testOrderId }).unwrap();
      console.log("AI Review completed:", response);

      toast.success("AI review completed successfully");
    } catch (error) {
      console.error("AI Review failed:", error);

      toast.error("Failed to complete AI review");
    }
  };

  if (!testResults || testResults.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-600 mb-4">
            No test results available
          </p>
          <Button className="btn-primary" onClick={handleAddTestResult}>
            <Plus className="w-4 h-4 mr-2" />
            Add Test Result
          </Button>
        </div>
        <AddTestResultModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          testOrderId={testOrderId}
        />
      </>
    );
  }

  const abnormalResults = testResults.filter((r) => r.status === "abnormal");

  return (
    <div className="space-y-6">
      {/* Alert for abnormal results */}
      {abnormalResults.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">
              {abnormalResults.length} Abnormal Result
              {abnormalResults.length > 1 ? "s" : ""} Found
            </h3>
            <p className="text-red-700 text-sm">
              The following test results are outside the normal range and
              require attention:
            </p>
            <div className="mt-2 space-y-1">
              {abnormalResults.map((r) => (
                <p key={r._id} className="text-sm text-red-700">
                  • <span className="font-semibold">{r.testName}</span>:{" "}
                  {r.result} {r.unit} (Normal: {r.normalRange})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <TrendingUp className="w-6 h-6" />
              Test Results ({testResults.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white cursor-pointer"
                onClick={handleAIReviewTestResult}
                disabled={isLoading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? "Reviewing..." : "AI Review"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700 min-w-[150px]">
                    Test Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center min-w-[100px]">
                    Result
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center min-w-[80px]">
                    Unit
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">
                    Normal Range
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center min-w-[80px]">
                    Flag
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center min-w-[100px]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((result) => (
                  <TableRow
                    key={result._id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      result.status === "abnormal" ? "bg-red-50" : ""
                    }`}
                  >
                    <TableCell className="font-semibold text-gray-900">
                      {result.testName}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-blue-600">
                        {result.result}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                      {result.unit}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                      {result.normalRange}
                    </TableCell>
                    <TableCell className="text-center">
                      {result.flag ? (
                        <span
                          className={`inline-block px-2 py-1 rounded font-bold text-sm ${getFlagBadge(
                            result.flag
                          )}`}
                        >
                          {result.flag}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getResultStatusColor(
                          result.status
                        )}`}
                      >
                        {result.status.charAt(0).toUpperCase() +
                          result.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CommentsSection comments={comments} testOrderId={testOrderId} />

      {/* Add Test Result Modal */}
      <AddTestResultModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        testOrderId={testOrderId}
      />
    </div>
  );
}
