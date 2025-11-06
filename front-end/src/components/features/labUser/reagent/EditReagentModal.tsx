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
import { Loader2 } from "lucide-react";
import type { Reagent, CreateReagentRequest } from "@/types/reagent.type";

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
    category: "",
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
        category: reagent.category || "",
        storageConditions: reagent.storageConditions || "",
        isActive: reagent.isActive ?? true,
      });
    }
  }, [reagent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUsageChange = (field: "min" | "max" | "unit", value: string | number) => {
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

      if (!Number.isInteger(formData.usagePerRun.min) || !Number.isInteger(formData.usagePerRun.max)) {
        toast.error("Dosage must be an integer (1, 2, 3...)");
        return;
      }

      if (formData.usagePerRun.min > formData.usagePerRun.max) {
        toast.error("Min dosage cannot be greater than Max");
        return;
      }
    }

    try {
      await updateReagent({ id: reagent._id, body: formData }).unwrap();
      toast.success("Reagent updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update reagent");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 max-h-[95vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Edit Reagent</DialogTitle>
          <DialogDescription>
            Update reagent information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            {/* Row 1: Reagent Name */}
            <div className="col-span-3 space-y-1.5">
              <Label className="text-sm font-semibold">
                Reagent Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="Enter reagent name"
                className="h-9"
              />
            </div>

            {/* Row 2: Catalog, Manufacturer, CAS */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Catalog Number <span className="text-red-500">*</span>
              </Label>
              <Input 
                name="catalogNumber" 
                value={formData.catalogNumber} 
                onChange={handleChange} 
                required 
                placeholder="e.g. DL-100"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Manufacturer <span className="text-red-500">*</span>
              </Label>
              <Input 
                name="manufacturer" 
                value={formData.manufacturer} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Acme Diagnostics"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">CAS Number</Label>
              <Input 
                name="casNumber" 
                value={formData.casNumber} 
                onChange={handleChange} 
                placeholder="e.g. 7732-18-5"
                className="h-9"
              />
            </div>

            {/* Row 3: Category, Ratio, Storage */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Category</Label>
              <Input 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                placeholder="e.g. Chemical"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Dilution Ratio</Label>
              <Input 
                name="ratio" 
                value={formData.ratio} 
                onChange={handleChange} 
                placeholder="e.g. 1:10 to 1:20"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Storage Conditions</Label>
              <Input 
                name="storageConditions" 
                value={formData.storageConditions} 
                onChange={handleChange} 
                placeholder="e.g. 2-8°C"
                className="h-9"
              />
            </div>

            {/* Row 4: Dosage and Status */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-semibold">Usage Per Run (Min-Max-Unit)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="1"
                  value={formData.usagePerRun?.min}
                  onChange={(e) => handleUsageChange("min", e.target.value)}
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="1"
                  value={formData.usagePerRun?.max}
                  onChange={(e) => handleUsageChange("max", e.target.value)}
                  className="h-9"
                />
                <Select
                  value={formData.usagePerRun?.unit}
                  onValueChange={(v) => handleUsageChange("unit", v)}
                >
                  <SelectTrigger className="h-9">
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
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(v) => setFormData(prev => ({ ...prev, isActive: v === "active" }))}
              >
                <SelectTrigger className="h-9">
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
            <div className="col-span-3 space-y-1.5">
              <Label className="text-sm font-semibold">Description</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Detailed description..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
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