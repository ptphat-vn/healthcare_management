import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TestOrder } from "../testOrderList/TestOrderList";
import { useUpdateTestOrderMutation } from "@/services/testOrderApi";
import { useEffect, useState } from "react";
import Input from "@/components/ui/input/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  testOrderPatientInfoSchema,
  type TestOrderPatientInfo,
} from "@/schemas/testOrderSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { requestedTests, type RequestedTestName } from "@/types/request.type";

interface EditTestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: TestOrder | null;
  onSuccess?: () => void;
}

export default function EditTestOrderModal({
  open,
  onOpenChange,
  order,
  onSuccess,
}: EditTestOrderModalProps) {
  const [updateTestOrder, { isLoading }] = useUpdateTestOrderMutation();
  const { user } = useAuth();
  const [selectedTests, setSelectedTests] = useState<RequestedTestName[]>([]);
  const [testsError, setTestsError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<TestOrderPatientInfo>({
    resolver: zodResolver(testOrderPatientInfoSchema),
    defaultValues: {
      patientName: order?.patientName,
      dateOfBirth: order?.dateOfBirth,
      gender: order?.gender,
      address: order?.address,
      phoneNumber: order?.phoneNumber,
      email: order?.email,
    },
  });

  // Reset form khi order thay đổi
  useEffect(() => {
    if (order) {
      reset({
        patientName: order.patientName || "",
        dateOfBirth: order.dateOfBirth || "",
        gender: order.gender || "male",
        address: order.address || "",
        phoneNumber: order.phoneNumber || "",
        email: order.email || "",
      });

      const normalizedTests =
        order.requestedTests?.filter((t: string): t is RequestedTestName =>
          (requestedTests as readonly string[]).includes(t)
        ) || [];
      setSelectedTests(normalizedTests);
    }
  }, [order, reset]);

  const onSubmit = async (data: TestOrderPatientInfo) => {
    if (!order) return;

    if (selectedTests.length === 0) {
      setTestsError("Please select at least one test");
      toast.error("Select at least one test before updating");
      return;
    }

    try {
      await updateTestOrder({
        id: order._id,
        patientName: data.patientName,
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender,
        address: data.address || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        requestedTests: selectedTests,
      }).unwrap();

      toast.success("Test order updated successfully!");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const anyErr = err as {
        data?: { message?: string; errors?: Record<string, string> };
      };
      const baseMessage = anyErr?.data?.message ?? "Unknown error";

      const fieldErrors = anyErr?.data?.errors;
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof TestOrderPatientInfo, {
            type: "server",
            message,
          });
        });
      }

      const detailMessage = fieldErrors
        ? Object.entries(fieldErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join("; ")
        : "";

      const finalMessage = detailMessage
        ? `${baseMessage}. Details: ${detailMessage}`
        : baseMessage;

      toast.error(`Update failed: ${finalMessage}`);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-auto max-w-[96vw] sm:max-w-3xl p-0 gap-0 overflow-hidden max-h-[92vh] sm:max-h-[95vh] rounded-xl sm:rounded-lg">
        <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b bg-white shrink-0">
          <DialogTitle className="text-lg sm:text-2xl font-bold">
            Edit Test Order
          </DialogTitle>
        </DialogHeader>

        {/* Body scrollable on mobile when content is long */}
        <div className="px-3 sm:px-6 py-4 overflow-y-auto max-h-[calc(92vh-4.5rem)] sm:max-h-[calc(95vh-4.5rem)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Patient Name"
              {...register("patientName")}
              required
              error={errors.patientName?.message}
              placeholder="Enter patient name"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                {...register("dateOfBirth")}
                required
                error={errors.dateOfBirth?.message}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Gender
                </label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-sm text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                {...register("phoneNumber")}
                placeholder="Enter phone number"
                error={errors.phoneNumber?.message}
                required
              />

              <Input
                label="Email"
                type="email"
                {...register("email")}
                placeholder="Enter email"
                error={errors.email?.message}
                required
              />
            </div>
            <Input
              label="Address"
              {...register("address")}
              placeholder="Enter address"
              error={errors.address?.message}
              required
            />

            {/* Select Tests - giống TestOrderAddForm */}
            <section className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Select Tests
                </label>
                <span className="text-xs text-gray-500">
                  Choose one or more requested tests
                </span>
              </div>
              <div className="rounded-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-600">
                        <th className="p-2 border border-gray-200 w-10 sm:w-12">
                          #
                        </th>
                        <th className="p-2 border border-gray-200">
                          Test Name
                        </th>
                        <th className="p-2 border border-gray-200 text-center w-16 sm:w-20">
                          Select
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestedTests.map((test, idx) => (
                        <tr
                          key={test}
                          className="odd:bg-white even:bg-gray-50 text-gray-800"
                        >
                          <td className="p-2 border border-gray-200 text-center">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-gray-200 wrap-break-word">
                            {test}
                          </td>
                          <td className="p-2 border border-gray-200 text-center">
                            <Checkbox
                              checked={selectedTests.includes(test)}
                              onCheckedChange={(checked) => {
                                if (checked === true) {
                                  setSelectedTests((prev) => [...prev, test]);
                                  setTestsError(null);
                                } else if (checked === false) {
                                  setSelectedTests((prev) =>
                                    prev.filter((t) => t !== test)
                                  );
                                  setTestsError(null);
                                }
                              }}
                              id={`edit-test-checkbox-${idx}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {testsError && (
                <p className="text-xs text-red-500">{testsError}</p>
              )}
            </section>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                className="h-8 px-3 text-xs sm:text-sm sm:h-9"
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className={`${getRoleButtonClass(
                  user?.data.roleCode
                )} h-8 px-3 text-xs sm:text-sm sm:h-9`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
