import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useUpdateReagentMutation } from "@/services/reagentApi";
import { Loader2, Minus, Plus } from "lucide-react";
import type { Reagent, CreateReagentRequest } from "@/types/reagent.type";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";
import { useAuth } from "@/hooks/useAuth";
import {
  updateReagentSchema,
  type UpdateReagentFormData,
} from "@/schemas/reagentSchema";

interface EditReagentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reagent: Reagent | null;
  onSuccess?: () => void;
}

export default function EditReagentModal({
  open,
  onOpenChange,
  reagent,
  onSuccess,
}: EditReagentModalProps) {
  const [updateReagent, { isLoading }] = useUpdateReagentMutation();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdateReagentFormData>({
    resolver: zodResolver(updateReagentSchema),
    defaultValues: {
      name: "",
      catalogNumber: "",
      manufacturer: "",
      casNumber: "",
      description: "",
      usagePerRun: {
        min: 0,
        max: 0,
        unit: "ml",
      },
      ratio: "",
      categories: "",
      storageConditions: "",
      isActive: true,
    },
  });

  const usagePerRun = watch("usagePerRun");

  useEffect(() => {
    if (reagent) {
      const usagePerRun = reagent.usagePerRun || { min: 0, max: 0, unit: "ml" };
      reset({
        name: reagent.name || "",
        catalogNumber: reagent.catalogNumber || "",
        manufacturer: reagent.manufacturer || "",
        casNumber: reagent.casNumber || "",
        description: reagent.description || "",
        usagePerRun: {
          min: usagePerRun.min || 0,
          max: usagePerRun.max || 0,
          unit:
            usagePerRun.unit === "ml" ||
            usagePerRun.unit === "μl" ||
            usagePerRun.unit === "L"
              ? usagePerRun.unit
              : "ml",
        },
        ratio: reagent.ratio || "",
        categories:
          Array.isArray(reagent.categories) && reagent.categories.length > 0
            ? reagent.categories[0]
            : typeof reagent.categories === "string"
            ? reagent.categories
            : "",
        storageConditions: reagent.storageCondition?.toString() || "",
        isActive: reagent.isActive ?? true,
      });
    }
  }, [reagent, reset]);

  const adjustUsage = (field: "min" | "max", delta: 1 | -1) => {
    const current = usagePerRun?.[field] ?? 0;
    const next = current + delta;

    if (next < 0) {
      return;
    }

    setValue(
      "usagePerRun",
      {
        min: usagePerRun?.min ?? 0,
        max: usagePerRun?.max ?? 0,
        unit: usagePerRun?.unit ?? "ml",
        [field]: next,
      },
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: UpdateReagentFormData) => {
    if (!reagent) return;

    try {
      // Transform data to match backend schema
      const { storageConditions, categories, ...restFormData } = data;
      const payload: {
        name?: string;
        catalogNumber?: string;
        manufacturer?: string;
        casNumber?: string;
        description?: string;
        usagePerRun?: { min: number; max: number; unit: string };
        ratio?: string;
        categories?: string[];
        storageCondition?: number;
        isActive?: boolean;
      } = {
        ...restFormData,
        // Convert categories string to array if provided
        categories: categories ? [categories] : undefined,
        // Convert storageConditions string to storageCondition number
        storageCondition: storageConditions
          ? Number(storageConditions)
          : undefined,
      };

      await updateReagent({
        id: reagent._id,
        body: payload as unknown as Partial<CreateReagentRequest>,
      }).unwrap();
      toast.success("Reagent updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Unable to update reagent");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-full max-w-xl lg:max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden mx-auto rounded-lg">
        <DialogHeader className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b shrink-0 rounded-t-lg">
          <DialogTitle className="text-base sm:text-lg lg:text-xl">
            Edit Reagent
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update reagent information
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 flex-1 overflow-y-auto overflow-x-hidden min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 sm:gap-x-4 gap-y-2 sm:gap-y-2.5 min-w-0">
              {/* Row 1: Reagent Name - Full width */}
              <div className="col-span-1 sm:col-span-2 space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Reagent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="Enter reagent name"
                  className="h-8 text-sm w-full min-w-0"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Row 2: Catalog Number, Manufacturer, CAS Number */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Catalog Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("catalogNumber")}
                  placeholder="e.g.  DL-100"
                  className="h-8 text-sm w-full min-w-0"
                />
                {errors.catalogNumber && (
                  <p className="text-xs text-red-500">
                    {errors.catalogNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Manufacturer <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("manufacturer")}
                  placeholder="e.g.  Acme Diagnostics"
                  className="h-8 text-sm w-full min-w-0"
                />
                {errors.manufacturer && (
                  <p className="text-xs text-red-500">
                    {errors.manufacturer.message}
                  </p>
                )}
              </div>
              <div className="space-y-1 sm:col-span-2 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  CAS Number
                </Label>
                <Input
                  {...register("casNumber")}
                  placeholder="e.g.  7732-18-5"
                  className="h-8 text-sm w-full min-w-0"
                />
                {errors.casNumber && (
                  <p className="text-xs text-red-500">
                    {errors.casNumber.message}
                  </p>
                )}
              </div>

              {/* Row 3: Category, Ratio, Storage Conditions */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="categories"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-8 text-sm w-full min-w-0">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hematology">Hematology</SelectItem>
                        <SelectItem value="Biochemistry">
                          Biochemistry
                        </SelectItem>
                        <SelectItem value="Immunology">Immunology</SelectItem>
                        <SelectItem value="Molecular/PCR">
                          Molecular/PCR
                        </SelectItem>
                        <SelectItem value="Microbiology">
                          Microbiology
                        </SelectItem>
                        <SelectItem value="Coagulation">Coagulation</SelectItem>
                        <SelectItem value="Enzyme">Enzyme</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categories && (
                  <p className="text-xs text-red-500">
                    {errors.categories.message}
                  </p>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Dilution Ratio <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("ratio")}
                  placeholder="e.g. 1:10 to 1:20"
                  className="h-8 text-sm w-full min-w-0"
                />
                {errors.ratio && (
                  <p className="text-xs text-red-500">{errors.ratio.message}</p>
                )}
              </div>
              <div className="space-y-1 sm:col-span-2 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Storage Conditions <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("storageConditions")}
                  placeholder="e.g.  2-8°C"
                  className="h-8 text-sm w-full min-w-0"
                />
                {errors.storageConditions && (
                  <p className="text-xs text-red-500">
                    {errors.storageConditions.message}
                  </p>
                )}
              </div>

              {/* Row 4: Dosage and Status */}
              <div className="space-y-1 sm:col-span-2 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Usage Per Run (Min-Max-Unit){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="usagePerRun"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-md rounded-r-none border-r-0"
                          onClick={() => adjustUsage("min", -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          placeholder="Min"
                          min="0"
                          step="1"
                          value={field.value?.min ?? 0}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            field.onChange({
                              ...field.value!,
                              min: val,
                            });
                          }}
                          className="h-8 rounded-none border-x-0 text-center text-sm w-full min-w-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-md rounded-l-none border-l-0"
                          onClick={() => adjustUsage("min", 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-md rounded-r-none border-r-0"
                          onClick={() => adjustUsage("max", -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          placeholder="Max"
                          min="0"
                          step="1"
                          value={field.value?.max ?? 0}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            field.onChange({
                              ...field.value!,
                              max: val,
                            });
                          }}
                          className="h-8 rounded-none border-x-0 text-center text-sm w-full min-w-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-md rounded-l-none border-l-0"
                          onClick={() => adjustUsage("max", 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select
                        value={field.value?.unit || "ml"}
                        onValueChange={(v) =>
                          field.onChange({
                            ...field.value!,
                            unit: v as "ml" | "μl" | "L",
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm w-full min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="μl">μl</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errors.usagePerRun && (
                  <p className="text-xs text-red-500">
                    {errors.usagePerRun.min?.message ||
                      errors.usagePerRun.max?.message ||
                      errors.usagePerRun.unit?.message ||
                      errors.usagePerRun.message}
                  </p>
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Status
                </Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? "active" : "inactive"}
                      onValueChange={(v) => field.onChange(v === "active")}
                    >
                      <SelectTrigger className="h-8 text-sm w-full min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                            <span>Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.isActive && (
                  <p className="text-xs text-red-500">
                    {errors.isActive.message}
                  </p>
                )}
              </div>

              {/* Row 5: Description - Full width */}
              <div className="col-span-1 sm:col-span-2 space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Description
                </Label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Detailed description of usage and application..."
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-3 sm:px-5 py-2.5 sm:py-3 border-t flex flex-col sm:flex-row sm:justify-end gap-2 shrink-0 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={getRoleButtonClass(user?.data.roleCode)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Reagent"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
