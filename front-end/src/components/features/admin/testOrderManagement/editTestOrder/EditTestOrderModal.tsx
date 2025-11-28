import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { TestOrder } from "../testOrderList/TestOrderList";
import { useUpdateTestOrderMutation } from "@/services/testOrderApi";
import { useEffect } from "react";
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
  const {
    register,
    handleSubmit,
    control,
    reset,
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
    }
  }, [order, reset]);

  const onSubmit = async (data: TestOrderPatientInfo) => {
    if (!order) return;

    try {
      await updateTestOrder({
        id: order._id,
        patientName: data.patientName,
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender,
        address: data.address || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
      }).unwrap();

      toast.success("Test order updated successfully!");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error("Update failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Test Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Patient Name"
            {...register("patientName")}
            required
            error={errors.patientName?.message}
            placeholder="Enter patient name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              {...register("dateOfBirth")}
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
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              {...register("phoneNumber")}
              placeholder="Enter phone number"
              error={errors.phoneNumber?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email")}
              placeholder="Enter email"
              error={errors.email?.message}
            />
          </div>
          <Input
            label="Address"
            {...register("address")}
            placeholder="Enter address"
            error={errors.address?.message}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className={getRoleButtonClass(user?.data.roleCode)}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
