import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TestHistory {
  id: string;
  testType: string;
  testDate: string;
  status: "Complete" | "In Progress" | "Pending" | "Review";
  priority: "NORMAL" | "URGENT";
  performedBy: string;
  results?: string;
}

interface EditTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: TestHistory | null;
}

export default function EditTestDialog({
  open,
  onOpenChange,
  test,
}: EditTestDialogProps) {
  const [editForm, setEditForm] = useState<TestHistory | null>(null);

  useEffect(() => {
    if (test) {
      setEditForm({ ...test });
    }
  }, [test]);

  const handleSave = () => {
    if (!editForm) return;

    // TODO: Call API to update test
    // await updateTestMutation(editForm);

    toast.success("Test history updated successfully");
    onOpenChange(false);
  };

  if (!editForm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Test Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Test Type - Full Width */}
          <div>
            <Label
              htmlFor="testType"
              className="text-sm font-semibold text-gray-900"
            >
              Test Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="testType"
              value={editForm.testType}
              onChange={(e) =>
                setEditForm({ ...editForm, testType: e.target.value })
              }
              className="mt-1.5 h-11"
              placeholder="Enter test type"
            />
          </div>

          {/* Test Date and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="testDate"
                className="text-sm font-semibold text-gray-900"
              >
                Test Date
              </Label>
              <Input
                id="testDate"
                type="date"
                value={editForm.testDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, testDate: e.target.value })
                }
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label
                htmlFor="status"
                className="text-sm font-semibold text-gray-900"
              >
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(
                  value: "Complete" | "In Progress" | "Pending" | "Review"
                ) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Performed By and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="performedBy"
                className="text-sm font-semibold text-gray-900"
              >
                Performed By
              </Label>
              <Input
                id="performedBy"
                value={editForm.performedBy}
                onChange={(e) =>
                  setEditForm({ ...editForm, performedBy: e.target.value })
                }
                className="mt-1.5 h-11"
                placeholder="Enter performer name"
              />
            </div>
            <div>
              <Label
                htmlFor="priority"
                className="text-sm font-semibold text-gray-900"
              >
                Priority
              </Label>
              <Select
                value={editForm.priority}
                onValueChange={(value: "NORMAL" | "URGENT") =>
                  setEditForm({ ...editForm, priority: value })
                }
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results - Full Width */}
          <div>
            <Label
              htmlFor="results"
              className="text-sm font-semibold text-gray-900"
            >
              Results
            </Label>
            <Input
              id="results"
              value={editForm.results || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, results: e.target.value })
              }
              className="mt-1.5 h-11"
              placeholder="Enter test results"
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="btn-admin h-10 px-6 font-semibold"
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
