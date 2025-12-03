import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateTestResultMutation } from "@/services/testOrderApi";
import { useGetAllInstrumentsQuery } from "@/services/instrumentApi";

const testResultSchema = z.object({
  instrumentId: z.string().min(1, "Instrument is required"),
});

type TestResultFormData = z.infer<typeof testResultSchema>;

interface AddTestResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testOrderId: string;
}

export default function AddTestResultModal({
  open,
  onOpenChange,
  testOrderId,
}: AddTestResultModalProps) {
  const [createTestResult, { isLoading }] = useCreateTestResultMutation();
  const { data: instrumentsData, isLoading: loadingInstruments } =
    useGetAllInstrumentsQuery({ page: 1, limit: 100 });
  console.log(instrumentsData);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TestResultFormData>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      instrumentId: "",
    },
  });

  const onSubmit = async (data: TestResultFormData) => {
    try {
      await createTestResult({
        testOrderId,
        instrumentId: data.instrumentId,
      }).unwrap();

      toast.success("Test result added successfully!");
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add test result");
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add Test Result
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Select Instrument <span className="text-red-500">*</span>
            </label>
            <Controller
              name="instrumentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loadingInstruments}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue
                      placeholder={
                        loadingInstruments
                          ? "Loading instruments..."
                          : "Select an instrument"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {instrumentsData?.data?.instruments.map(
                      (instrument: any) => (
                        <SelectItem key={instrument._id} value={instrument._id}>
                          {instrument.name} - {instrument.model}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.instrumentId && (
              <p className="text-sm text-red-500">
                {errors.instrumentId.message}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The test result will be automatically
              generated based on the selected instrument configuration.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Adding..." : "Add Test Result"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
