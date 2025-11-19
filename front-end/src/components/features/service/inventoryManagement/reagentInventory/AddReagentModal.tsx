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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllReagentsQuery,
  useCreateVendorSupplyMutation,
} from "@/services/reagentApi";
import { useAuth } from "@/hooks/useAuth";

interface AddReagentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AddReagentFormData {
  reagentId: string;
  reagentName: string;
  catalogNumber: string;
  manufacturer: string;
  casNumber: string;
  vendorName: string;
  vendorId: string;
  purchaseOrderNumber: string;
  orderDate: string;
  receiptDate: string;
  quantityReceived: string;
  unitOfMeasure: string;
  lotNumber: string;
  expirationDate: string;
  receivedBy: string;
  initialStorageLocation: string;
  status: string;
}

export default function AddReagentModal({
  open,
  onClose,
  onSuccess,
}: AddReagentModalProps) {
  // Get current user info from useAuth hook
  const { user: currentUser } = useAuth();

  // Fetch reagents list for select
  const { data: reagentsData } = useGetAllReagentsQuery({
    page: 1,
    limit: 1000, // Get all reagents
    isActive: true,
  });

  const [createVendorSupply, { isLoading: isSubmitting }] =
    useCreateVendorSupplyMutation();

  const [formData, setFormData] = useState<AddReagentFormData>({
    reagentId: "",
    reagentName: "",
    catalogNumber: "",
    manufacturer: "",
    casNumber: "",
    vendorName: "",
    vendorId: "",
    purchaseOrderNumber: "",
    orderDate: "",
    receiptDate: "",
    quantityReceived: "",
    unitOfMeasure: "ml",
    lotNumber: "",
    expirationDate: "",
    receivedBy: currentUser?.data?._id || "",
    initialStorageLocation: "",
    status: "Received",
  });

  // Update receivedBy when user changes
  useEffect(() => {
    if (currentUser?.data?._id) {
      setFormData((prev) => ({
        ...prev,
        receivedBy: currentUser.data._id,
      }));
    }
  }, [currentUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReagentChange = (value: string) => {
    const selectedReagent = reagentsData?.data.reagents.find(
      (r) => r._id === value
    );
    if (selectedReagent) {
      setFormData((prev) => ({
        ...prev,
        reagentId: value,
        reagentName: selectedReagent.name,
        catalogNumber: selectedReagent.catalogNumber || "",
        manufacturer: selectedReagent.manufacturer || "",
        casNumber: selectedReagent.casNumber || "",
      }));
    }
  };

  const handleUnitChange = (value: string) => {
    setFormData((prev) => ({ ...prev, unitOfMeasure: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const resetForm = () => {
    setFormData({
      reagentId: "",
      reagentName: "",
      catalogNumber: "",
      manufacturer: "",
      casNumber: "",
      vendorName: "",
      vendorId: "",
      purchaseOrderNumber: "",
      orderDate: "",
      receiptDate: "",
      quantityReceived: "",
      unitOfMeasure: "ml",
      lotNumber: "",
      expirationDate: "",
      receivedBy: currentUser?.data?._id || "",
      initialStorageLocation: "",
      status: "Received",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.reagentId) {
      toast.error("Please select reagent");
      return;
    }
    if (!formData.vendorName.trim()) {
      toast.error("Please enter vendor name");
      return;
    }
    if (!formData.purchaseOrderNumber.trim()) {
      toast.error("Please enter purchase order number");
      return;
    }
    if (!formData.orderDate) {
      toast.error("Please select order date");
      return;
    }
    if (!formData.receiptDate) {
      toast.error("Please select receipt date");
      return;
    }
    if (!formData.lotNumber.trim()) {
      toast.error("Please enter lot number");
      return;
    }
    if (!formData.expirationDate) {
      toast.error("Please select expiration date");
      return;
    }
    if (!formData.quantityReceived || Number(formData.quantityReceived) <= 0) {
      toast.error("Please enter valid quantity");
      return;
    }

    // Date validations
    const expiryDate = new Date(formData.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate < today) {
      toast.error("Expiration date cannot be in the past");
      return;
    }

    const orderDate = new Date(formData.orderDate);
    const receiptDate = new Date(formData.receiptDate);
    if (receiptDate < orderDate) {
      toast.error("Receipt date cannot be before order date");
      return;
    }

    try {
      const payload = {
        reagentId: formData.reagentId,
        reagentName: formData.reagentName,
        catalogNumber: formData.catalogNumber,
        manufacturer: formData.manufacturer,
        casNumber: formData.casNumber,
        vendorName: formData.vendorName,
        vendorId: formData.vendorId,
        purchaseOrderNumber: formData.purchaseOrderNumber,
        orderDate: formData.orderDate,
        receiptDate: formData.receiptDate,
        quantityReceived: Number(formData.quantityReceived),
        unitOfMeasure: formData.unitOfMeasure,
        lotNumber: formData.lotNumber,
        expirationDate: formData.expirationDate,
        receivedBy: formData.receivedBy,
        initialStorageLocation: formData.initialStorageLocation,
        status: formData.status,
      };

      await createVendorSupply(payload).unwrap();

      toast.success("Reagent batch added successfully!");
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      console.error("Error adding reagent:", error);
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to add reagent batch");
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Add Vendor Supply
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Enter vendor supply details to add reagent batch to inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Reagent Selection */}
            <div className="grid gap-2">
              <Label htmlFor="reagentId" className="text-xs sm:text-sm">
                Reagent <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.reagentId}
                onValueChange={handleReagentChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Select reagent" />
                </SelectTrigger>
                <SelectContent>
                  {reagentsData?.data.reagents.map((reagent) => (
                    <SelectItem
                      key={reagent._id}
                      value={reagent._id}
                      className="text-xs sm:text-sm"
                    >
                      {reagent.name} - {reagent.manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendor Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vendorName" className="text-xs sm:text-sm">
                  Vendor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vendorName"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vendorId" className="text-xs sm:text-sm">
                  Vendor ID (Optional)
                </Label>
                <Input
                  id="vendorId"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  placeholder="Vendor ID"
                  disabled={isSubmitting}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Purchase Order & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="purchaseOrderNumber"
                  className="text-xs sm:text-sm"
                >
                  PO Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purchaseOrderNumber"
                  name="purchaseOrderNumber"
                  value={formData.purchaseOrderNumber}
                  onChange={handleInputChange}
                  placeholder="PO-XXX"
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="orderDate" className="text-xs sm:text-sm">
                  Order Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orderDate"
                  name="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="receiptDate" className="text-xs sm:text-sm">
                  Receipt Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="receiptDate"
                  name="receiptDate"
                  type="date"
                  value={formData.receiptDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Lot Number & Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lotNumber" className="text-xs sm:text-sm">
                  Lot Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lotNumber"
                  name="lotNumber"
                  value={formData.lotNumber}
                  onChange={handleInputChange}
                  placeholder="LOT-2024-XXX"
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expirationDate" className="text-xs sm:text-sm">
                  Expiration Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="quantityReceived"
                  className="text-xs sm:text-sm"
                >
                  Quantity Received <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantityReceived"
                  name="quantityReceived"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantityReceived}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  disabled={isSubmitting}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unitOfMeasure" className="text-xs sm:text-sm">
                  Unit of Measure <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unitOfMeasure}
                  onValueChange={handleUnitChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml (Milliliter)</SelectItem>
                    <SelectItem value="L">L (Liter)</SelectItem>
                    <SelectItem value="g">g (Gram)</SelectItem>
                    <SelectItem value="kg">kg (Kilogram)</SelectItem>
                    <SelectItem value="Strip">Strip</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Vial">Vial</SelectItem>
                    <SelectItem value="Kit">Kit</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Unit">Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Storage & Received By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="initialStorageLocation"
                  className="text-xs sm:text-sm"
                >
                  Storage Location (Optional)
                </Label>
                <Input
                  id="initialStorageLocation"
                  name="initialStorageLocation"
                  value={formData.initialStorageLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Shelf A1"
                  disabled={isSubmitting}
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="receivedBy" className="text-xs sm:text-sm">
                  Received By <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="receivedBy"
                  name="receivedBy"
                  value={currentUser?.data?.fullName || ""}
                  placeholder="Receiver name"
                  disabled={true}
                  readOnly
                  className="text-xs sm:text-sm bg-gray-50"
                  title={`User ID: ${currentUser?.data?._id || "N/A"}`}
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-xs sm:text-sm">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Partial Shipment">
                    Partial Shipment
                  </SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-service text-xs sm:text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supply
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
