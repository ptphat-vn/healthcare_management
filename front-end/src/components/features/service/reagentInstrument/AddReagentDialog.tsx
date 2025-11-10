import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetAllReagentsQuery, useGetReagentInventoryQuery } from "@/services/reagentApi";
import { useAddReagentToInstrumentMutation } from "@/services/instrumentApi";

interface AddReagentDialogProps {
  instrumentId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function AddReagentDialog({
  instrumentId,
  onSuccess,
  trigger,
}: AddReagentDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: reagentsData, isLoading: isLoadingReagents } = useGetAllReagentsQuery({ isActive: true });
  const [addReagentToInstrumentMutation, { isLoading }] = useAddReagentToInstrumentMutation();
  const [inventoryError, setInventoryError] = useState<string>("");
  
  const [formData, setFormData] = useState({
    reagentId: "",
    lotNumber: "",
    quantity: "",
    notes: "",
  });

  // Fetch inventory for selected reagent
  const { data: inventoryData } = useGetReagentInventoryQuery(
    { reagentId: formData.reagentId, includeExpired: false },
    { skip: !formData.reagentId }
  );

  const inventory = inventoryData?.data || [];
  const totalAvailable = inventory.reduce((sum, item) => sum + item.quantityAvailable, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.reagentId || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate quantity
    const quantity = Number(formData.quantity);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (!Number.isInteger(quantity)) {
      toast.error("Quantity must be an integer");
      return;
    }

    try {
      const payload: any = {
        reagentId: formData.reagentId,
        quantity: Number(formData.quantity),
      };
      
      if (formData.lotNumber) {
        payload.lotNumber = formData.lotNumber;
      }
      
      if (formData.notes) {
        payload.notes = formData.notes;
      }
      
      await addReagentToInstrumentMutation({
        instrumentId,
        reagentData: payload,
      }).unwrap();
      
      toast.success("Reagent assigned to instrument successfully");
      setOpen(false);
      setInventoryError("");
      setFormData({
        reagentId: "",
        lotNumber: "",
        quantity: "",
        notes: "",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to assign reagent";
      
      // Check if it's an inventory error
      if (errorMessage.includes("inventory") || errorMessage.includes("stock")) {
        setInventoryError(errorMessage);
      }
      
      toast.error(errorMessage);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear inventory error when user changes reagent selection
    if (field === "reagentId") {
      setInventoryError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2 btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            <span>Add Reagent</span>
          </Button>
        )} 
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Reagent to Instrument</DialogTitle>
            <DialogDescription>
              Assign a reagent to this instrument. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Inventory Error Alert */}
            {inventoryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {inventoryError}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Please add inventory for this reagent first or select a different reagent.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reagent Selection */}
            <div className="grid gap-2">
              <Label htmlFor="reagent">
                Reagent <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.reagentId}
                onValueChange={(value) => handleChange("reagentId", value)}
                required
                disabled={isLoadingReagents}
              >
                <SelectTrigger id="reagent">
                  <SelectValue placeholder={isLoadingReagents ? "Loading reagents..." : "Select a reagent"} />
                </SelectTrigger>
                <SelectContent>
                  {reagentsData?.data?.reagents && reagentsData.data.reagents.length > 0 ? (
                    reagentsData.data.reagents.map((reagent) => (
                      <SelectItem key={reagent._id} value={reagent._id}>
                        {reagent.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-reagents" disabled>
                      No active reagents available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Lot Number */}
            <div className="grid gap-2">
              <Label htmlFor="lotNumber">
                Lot Number (Optional)
              </Label>
              {inventory.length > 0 ? (
                <Select
                  value={formData.lotNumber}
                  onValueChange={(value) => handleChange("lotNumber", value)}
                >
                  <SelectTrigger id="lotNumber">
                    <SelectValue placeholder="Auto-select using FIFO (recommended)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-select using FIFO</SelectItem>
                    {inventory.map((item) => (
                      <SelectItem key={item.lotNumber} value={item.lotNumber}>
                        {item.lotNumber} - Available: {item.quantityAvailable} {item.unitOfMeasure} 
                        {item.isExpiringSoon && " ⚠️ Expiring soon"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="lotNumber"
                  placeholder="No lots available"
                  value={formData.lotNumber}
                  onChange={(e) => handleChange("lotNumber", e.target.value)}
                  disabled
                />
              )}
              {inventory.length > 0 && !formData.lotNumber && (
                <p className="text-xs text-gray-500">
                  System will automatically select the lot with earliest expiration date (FIFO)
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={totalAvailable > 0 ? totalAvailable : undefined}
                step="1"
                placeholder={totalAvailable > 0 ? `Max: ${totalAvailable}` : "Enter quantity"}
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
                disabled={inventory.length === 0}
              />
              {totalAvailable > 0 && formData.quantity && Number(formData.quantity) > totalAvailable && (
                <p className="text-xs text-red-600">
                  ⚠️ Requested quantity exceeds available inventory ({totalAvailable} {inventory[0]?.unitOfMeasure})
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                placeholder="Enter notes (e.g., Assigned for routine testing)"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2 btn-primary"
              disabled={isLoading || (!!formData.reagentId && inventory.length === 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {formData.reagentId && inventory.length === 0 ? "No Inventory Available" : "Add Reagent"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
