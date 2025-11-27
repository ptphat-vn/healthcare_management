import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface DeleteTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: TestHistory | null;
}

export default function DeleteTestDialog({
  open,
  onOpenChange,
  test,
}: DeleteTestDialogProps) {
  const handleConfirmDelete = () => {
    if (!test) return;

    // TODO: Call API to delete test
    // await deleteTestMutation(test.id);

    toast.success("Test history deleted successfully");
    onOpenChange(false);
  };

  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
            <Trash2 className="h-6 w-6" />
            Delete Test History
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this test history? This action cannot
            be undone.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Test ID:</span> {test.id}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Test Type:</span> {test.testType}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(test.testDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}