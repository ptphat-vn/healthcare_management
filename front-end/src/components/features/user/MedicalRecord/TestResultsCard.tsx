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
      <Card className="border border-slate-100 bg-white/90 shadow-xl backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">
              Test Results
            </CardTitle>
            <p className="text-sm text-slate-500">
              Lab insights delivered directly to your chart
            </p>
          </div>
          <Badge className="rounded-full bg-slate-900/5 text-slate-700 border border-slate-200 px-3 py-1">
            {formattedTestResults.length
              ? `${formattedTestResults.length} result${
                  formattedTestResults.length > 1 ? "s" : ""
                }`
              : "Awaiting results"}
          </Badge>
        </CardHeader>
        <CardContent>
          {formattedTestResults.length ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="min-w-[220px] text-slate-600 font-semibold">
                      Test
                    </TableHead>
                    <TableHead className="min-w-[130px] text-slate-600 font-semibold">
                      Result
                    </TableHead>
                    <TableHead className="min-w-[150px] text-slate-600 font-semibold">
                      Normal Range
                    </TableHead>
                    <TableHead className="min-w-[130px] text-slate-600 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[190px] text-slate-600 font-semibold">
                      Reviewed At
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formattedTestResults.map((result) => (
                    <TableRow
                      key={result.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {result.name}
                      </TableCell>
                      <TableCell
                        className={`text-slate-900 ${
                          result.status?.toLowerCase() === "abnormal"
                            ? "font-semibold"
                            : ""
                        }`}
                      >
                        {result.value}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {result.normalRange}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${result.styles.badge}`}
                        >
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {formatDateTime(result.reviewedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
              We are waiting for your laboratory team to publish the latest
              results. They will appear here automatically once available.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
