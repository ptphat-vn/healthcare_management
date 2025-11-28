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
import {
  useGetAllReagentsQuery,
  useGetReagentInventoryFIFOQuery,
} from "@/services/reagentApi";
import { useAddReagentToInstrumentMutation } from "@/services/instrumentApi";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

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
  const { data: reagentsData, isLoading: isLoadingReagents } =
    useGetAllReagentsQuery({ isActive: true });
  const [addReagentToInstrumentMutation, { isLoading }] =
    useAddReagentToInstrumentMutation();
  const [inventoryError, setInventoryError] = useState<string>("");
const {user} = useAuth()
  const [formData, setFormData] = useState({
    reagentId: "",
    lotNumber: "",
    quantity: "",
    notes: "",
  });

  // Fetch inventory for selected reagent
  const { data: inventoryData, isLoading: isLoadingInventory, refetch: refetchInventory } =
     useGetReagentInventoryFIFOQuery(
      { 
        reagentId: formData.reagentId,
        includeExpired: false, // Thêm param này
        page: 1,
        limit: 1000 
      },
      { 
        skip: !formData.reagentId,
        refetchOnMountOrArgChange: true 
      }
    );
  console.log(formData.reagentId, "reagentIddd");

  const inventory = inventoryData?.data?.inventory || [];
  console.log(inventoryData, "dataa");
  
  console.log(inventory, "hehehe");
  
  // Debug: Log inventory data
  console.log('=== INVENTORY DEBUG ===');
  console.log('Selected reagentId:', formData.reagentId);
  console.log('Inventory data:', inventoryData);
  console.log('Inventory array:', inventory);
  console.log('Number of lots:', inventory.length);
  
  const totalAvailable = inventory.reduce(
    (sum, item) => sum + item.quantityAvailable,
    0
  );

  const resetForm = () => {
    setFormData({
      reagentId: "",
      lotNumber: "",
      quantity: "",
      notes: "",
    });
    setInventoryError("");
  };

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
      resetForm();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to assign reagent";

      // Check if it's an inventory error or category mismatch
      if (
        errorMessage.includes("inventory") ||
        errorMessage.includes("stock") ||
        errorMessage.includes("category") ||
        errorMessage.includes("common category")
      ) {
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

    // Clear inventory error and reset quantity when user changes reagent selection
    if (field === "reagentId") {
      setInventoryError("");
      setFormData((prev) => ({
        ...prev,
        lotNumber: "",
        quantity: "",
      }));
      // Refetch inventory for selected reagent to get all lots
      if (value && refetchInventory) {
        setTimeout(() => refetchInventory(), 100);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={getRoleButtonClass(user?.data.roleCode)}>
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
              Assign a reagent to this instrument. Fill in all the required
              information.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error Alert */}
            {inventoryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {inventoryError}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {inventoryError.includes("category") ||
                      inventoryError.includes("common category")
                        ? "The instrument and reagent must have at least one matching category. Please select a compatible reagent."
                        : "Please add inventory for this reagent first or select a different reagent."}
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
                  <SelectValue
                    placeholder={
                      isLoadingReagents
                        ? "Loading reagents..."
                        : "Select a reagent"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {reagentsData?.data?.reagents &&
                  reagentsData.data.reagents.length > 0 ? (
                    reagentsData.data.reagents.map((reagent, index) => (
                      <SelectItem key={index} value={reagent._id}>
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
              {formData.reagentId && isLoadingInventory && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading inventory...
                </p>
              )}
              {formData.reagentId &&
                !isLoadingInventory &&
                inventory.length === 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                    ⚠️ No inventory available. System will use FIFO to auto-allocate when stock becomes available.
                  </p>
                )}
              {formData.reagentId && !isLoadingInventory && inventory.length > 0 && (
                <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
                  ✓ {totalAvailable} {inventory[0]?.unitOfMeasure} available across {inventory.length} lot{inventory.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Lot Number */}
            <div className="grid gap-2">
              <Label htmlFor="lotNumber">
                Lot Number <span className="text-gray-400 text-xs">(Optional - FIFO auto-select)</span>
              </Label>
              {inventory.length > 0 ? (
                <Select
                  value={formData.lotNumber || "auto-fifo"}
                  onValueChange={(value) => handleChange("lotNumber", value === "auto-fifo" ? "" : value)}
                >
                  <SelectTrigger id="lotNumber" className="h-auto min-h-[60px]">
                    <SelectValue placeholder="Auto-select using FIFO" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="auto-fifo">
                      Auto-select using FIFO {inventory[0] && `(${inventory[0].lotNumber})`}
                    </SelectItem>
                    {inventory.map((item, index) => (
                      <SelectItem key={item.lotNumber} value={item.lotNumber} className="py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{item.lotNumber}</span>
                            {index === 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">FIFO</span>}
                            {item.isExpiringSoon && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Expiring Soon</span>}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Available: {item.quantityAvailable} {item.unitOfMeasure} • Exp: {new Date(item.expirationDate).toLocaleDateString()}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                  🔄 FIFO auto-selection enabled
                </div>
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
                step="1"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
              />
              {totalAvailable > 0 && formData.quantity && Number(formData.quantity) > totalAvailable && (
                <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
                  ⚠️ Warning: Requested {formData.quantity} exceeds current inventory ({totalAvailable} {inventory[0]?.unitOfMeasure}).
                  System will allocate from available stock using FIFO.
                </p>
              )}
              {inventory.length > 0 && totalAvailable > 0 && (
                <p className="text-xs text-gray-500">
                  Current inventory: {totalAvailable} {inventory[0]?.unitOfMeasure}
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
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={getRoleButtonClass(user?.data.roleCode)}
              disabled={isLoading || !formData.reagentId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reagent
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}