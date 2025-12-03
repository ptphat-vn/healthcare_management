import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TestResults } from "@/types/testOrder.type";

const statusStyles: Record<
  string,
  { bg: string; text: string; badge: string }
> = {
  normal: {
    bg: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  abnormal: {
    bg: "bg-rose-50 border-rose-100",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-700",
  },
  pending: {
    bg: "bg-amber-50 border-amber-100",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  default: {
    bg: "bg-slate-50 border-slate-100",
    text: "text-slate-700",
    badge: "bg-slate-200 text-slate-700",
  },
};

interface TestResultsCardProps {
  testResults: TestResults[];
  formatDateTime: (value?: string) => string;
}

export default function TestResultsCard({
  testResults,
  formatDateTime,
}: TestResultsCardProps) {
  const formattedTestResults = testResults.map((result) => {
    const statusKey =
      result.status?.toLowerCase() || result.flag?.toLowerCase();
    const styles = statusStyles[statusKey || "default"] || statusStyles.default;
    return {
      id: result._id,
      name: result.testName,
      value: result.unit ? `${result.result} ${result.unit}` : result.result,
      normalRange: result.normalRange || "Not provided",
      status: result.status || result.flag || "Pending",
      reviewedAt: result.updatedAt || result.createdAt,
      styles,
    };
  });

  return (
    <section>
      <Card className="border border-slate-200/60 bg-white/95 shadow-xl backdrop-blur-sm overflow-hidden hover:shadow-2xl transition-all duration-300 w-full max-w-full">
        <CardHeader className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between bg-linear-to-r from-indigo-50/50 to-purple-50/50 border-b border-slate-100 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-5">
          <div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Test Results
            </CardTitle>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-1.5">
              Lab insights delivered directly to your chart
            </p>
          </div>
          <Badge className="rounded-full bg-linear-to-r from-indigo-100 to-purple-100 text-slate-700 border border-slate-200/60 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold shrink-0 self-start md:self-auto shadow-sm">
            {formattedTestResults.length
              ? `${formattedTestResults.length} result${
                  formattedTestResults.length > 1 ? "s" : ""
                }`
              : "Awaiting results"}
          </Badge>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
          {formattedTestResults.length ? (
            <>
              {/* Mobile layout: stacked cards to avoid horizontal overflow */}
              <div className="space-y-3 sm:space-y-4 md:hidden w-full max-w-full">
                {formattedTestResults.map((result) => (
                  <div
                    key={result.id}
                    className={`rounded-xl border px-3 py-3 sm:px-4 sm:py-4 shadow-sm ${result.styles.bg} ${result.styles.text} w-full max-w-full`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Test
                        </p>
                        <p className="text-sm font-semibold text-slate-900 wrap-break-word">
                          {result.name}
                        </p>
                      </div>
                      <Badge
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm shrink-0 ${result.styles.badge}`}
                      >
                        {result.status}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <div className="flex justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">
                          Result
                        </p>
                        <p
                          className={`text-sm text-right wrap-break-word ${
                            result.status?.toLowerCase() === "abnormal"
                              ? "font-bold text-rose-600"
                              : "text-slate-900"
                          }`}
                        >
                          {result.value}
                        </p>
                      </div>
                      <div className="flex justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">
                          Normal Range
                        </p>
                        <p className="text-xs text-right text-slate-600 wrap-break-word">
                          {result.normalRange}
                        </p>
                      </div>
                      <div className="flex justify-between gap-3">
                        <p className="text-xs font-medium text-slate-500">
                          Reviewed At
                        </p>
                        <p className="text-xs text-right text-slate-600 break-words">
                          {formatDateTime(result.reviewedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop / tablet layout: table with horizontal scroll if needed */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 shadow-sm w-full max-w-full">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="min-w-[200px] lg:min-w-[220px] text-slate-700 font-bold text-xs sm:text-sm">
                        Test
                      </TableHead>
                      <TableHead className="min-w-[120px] lg:min-w-[130px] text-slate-700 font-bold text-xs sm:text-sm">
                        Result
                      </TableHead>
                      <TableHead className="min-w-[140px] lg:min-w-[150px] text-slate-700 font-bold text-xs sm:text-sm">
                        Normal Range
                      </TableHead>
                      <TableHead className="min-w-[120px] lg:min-w-[130px] text-slate-700 font-bold text-xs sm:text-sm">
                        Status
                      </TableHead>
                      <TableHead className="min-w-[170px] lg:min-w-[190px] text-slate-700 font-bold text-xs sm:text-sm">
                        Reviewed At
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedTestResults.map((result) => (
                      <TableRow
                        key={result.id}
                        className="hover:bg-slate-50/60 transition-colors duration-150 border-b border-slate-50"
                      >
                        <TableCell className="font-semibold text-slate-900 py-3 sm:py-4 wrap-break-word">
                          {result.name}
                        </TableCell>
                        <TableCell
                          className={`text-slate-900 py-3 sm:py-4 wrap-break-word ${
                            result.status?.toLowerCase() === "abnormal"
                              ? "font-bold text-rose-600"
                              : ""
                          }`}
                        >
                          {result.value}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-600 py-3 sm:py-4 wrap-break-word">
                          {result.normalRange}
                        </TableCell>
                        <TableCell className="py-3 sm:py-4">
                          <Badge
                            className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${result.styles.badge}`}
                          >
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-600 py-3 sm:py-4 wrap-break-word">
                          {formatDateTime(result.reviewedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-linear-to-br from-slate-50 to-slate-100/50 p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                We are waiting for your laboratory team to publish the latest
                results. They will appear here automatically once available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
