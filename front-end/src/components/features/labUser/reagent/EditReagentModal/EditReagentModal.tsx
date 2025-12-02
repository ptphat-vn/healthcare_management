import { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState<CreateReagentRequest>({
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
  });

  useEffect(() => {
    if (reagent) {
      setFormData({
        name: reagent.name || "",
        catalogNumber: reagent.catalogNumber || "",
        manufacturer: reagent.manufacturer || "",
        casNumber: reagent.casNumber || "",
        description: reagent.description || "",
        usagePerRun: reagent.usagePerRun || { min: 0, max: 0, unit: "ml" },
        ratio: reagent.ratio || "",
        categories:
          Array.isArray(reagent.categories) && reagent.categories.length > 0
            ? reagent.categories[0]
            : typeof reagent.categories === "string"
            ? reagent.categories
            : "",
        storageConditions: reagent.storageCondition || "",
        isActive: reagent.isActive ?? true,
      });
    }
  }, [reagent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUsageChange = (
    field: "min" | "max" | "unit",
    value: string | number
  ) => {
    if (field !== "unit") {
      const numValue = Number(value);

      if (numValue < 0) {
        toast.error("Dosage cannot be negative");
        return;
      }

      if (!Number.isInteger(numValue) && value !== "") {
        toast.error("Dosage must be an integer (1, 2, 3...)");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      usagePerRun: {
        ...prev.usagePerRun!,
        [field]: field === "unit" ? value : Number(value),
      },
    }));
  };

  const adjustUsage = (field: "min" | "max", delta: 1 | -1) => {
    const current = formData.usagePerRun?.[field] ?? 0;
    const next = current + delta;

    if (next < 0) return;

    handleUsageChange(field, next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reagent) return;

    if (!formData.name || !formData.catalogNumber || !formData.manufacturer) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.usagePerRun) {
      if (formData.usagePerRun.min < 0 || formData.usagePerRun.max < 0) {
        toast.error("Dosage cannot be negative");
        return;
      }

      if (
        !Number.isInteger(formData.usagePerRun.min) ||
        !Number.isInteger(formData.usagePerRun.max)
      ) {
        toast.error("Dosage must be an integer (1, 2, 3...)");
        return;
      }

      if (formData.usagePerRun.min > formData.usagePerRun.max) {
        toast.error("Min dosage cannot be greater than Max");
        return;
      }
    }

    try {
      // Transform data to match backend schema
      const { storageConditions, categories, ...restFormData } = formData;
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
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-xl lg:max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden mx-auto rounded-lg sm:rounded-lg">
        <DialogHeader className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b shrink-0 rounded-t-lg">
          <DialogTitle className="text-base sm:text-lg lg:text-xl">
            Edit Reagent
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update reagent information
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 flex-1 overflow-y-auto overflow-x-hidden min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 sm:gap-x-4 gap-y-2 sm:gap-y-2.5 min-w-0">
              {/* Row 1: Reagent Name */}
              <div className="col-span-1 sm:col-span-2 space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Reagent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter reagent name"
                  className="h-8 text-sm w-full min-w-0"
                />
              </div>

              {/* Row 2: Catalog, Manufacturer, CAS */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Catalog Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="catalogNumber"
                  value={formData.catalogNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g. DL-100"
                  className="h-8 text-sm w-full min-w-0"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Manufacturer <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Diagnostics"
                  className="h-8 text-sm w-full min-w-0"
                />
              </div>
              <div className="space-y-1 sm:col-span-2 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  CAS Number
                </Label>
                <Input
                  name="casNumber"
                  value={formData.casNumber}
                  onChange={handleChange}
                  placeholder="e.g. 7732-18-5"
                  className="h-8 text-sm w-full min-w-0"
                />
              </div>

              {/* Row 3: Category, Ratio, Storage */}
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Category
                </Label>
                <Select
                  value={formData.categories || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categories: value }))
                  }
                >
                  <SelectTrigger className="h-8 text-sm w-full min-w-0">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hematology">Hematology</SelectItem>
                    <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                    <SelectItem value="Immunology">Immunology</SelectItem>
                    <SelectItem value="Molecular/PCR">Molecular/PCR</SelectItem>
                    <SelectItem value="Microbiology">Microbiology</SelectItem>
                    <SelectItem value="Coagulation">Coagulation</SelectItem>
                    <SelectItem value="Enzyme">Enzyme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Dilution Ratio
                </Label>
                <Input
                  name="ratio"
                  value={formData.ratio}
                  onChange={handleChange}
                  placeholder="e.g. 1:10 to 1:20"
                  className="h-8 text-sm w-full min-w-0"
                />
              </div>
              <div className="space-y-1 sm:col-span-2 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Storage Conditions
                </Label>
                <Input
                  name="storageConditions"
                  value={formData.storageConditions}
                  onChange={handleChange}
                  placeholder="e.g. 2-8°C"
                  className="h-8 text-sm w-full min-w-0"
                />
              </div>

              {/* Row 4: Dosage and Status */}
              <div className="space-y-1 sm:col-span-2 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Usage Per Run (Min-Max-Unit)
                </Label>
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
                      value={formData.usagePerRun?.min}
                      onChange={(e) => handleUsageChange("min", e.target.value)}
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
                      value={formData.usagePerRun?.max}
                      onChange={(e) => handleUsageChange("max", e.target.value)}
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
                    value={formData.usagePerRun?.unit}
                    onValueChange={(v) => handleUsageChange("unit", v)}
                  >
                    <SelectTrigger className="h-8 text-sm w-full min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="μl">μl</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Status
                </Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: v === "active",
                    }))
                  }
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
              </div>

              {/* Row 5: Description */}
              <div className="col-span-1 sm:col-span-2 space-y-1 min-w-0">
                <Label className="text-xs sm:text-sm font-semibold">
                  Description
                </Label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Detailed description..."
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
