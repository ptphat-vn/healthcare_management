import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export interface TestOrderFormData {
  patientName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "";
  address: string;
  phoneNumber: string;
  email: string;
}

interface TestOrderFormProps {
  onSubmit: (formData: TestOrderFormData) => void;
  onCancel: () => void;
  initialData?: TestOrderFormData;
}

export default function TestOrderForm({
  onSubmit,
  onCancel,
  initialData,
}: TestOrderFormProps) {
  const [formData, setFormData] = useState<TestOrderFormData>(
    initialData || {
      patientName: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      phoneNumber: "",
      email: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number must be 10-11 digits";
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Phone number must be 10-11 digits";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">
            Patient Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="patientName"
            name="patientName"
            placeholder="e.g. Nguyễn Văn A"
            value={formData.patientName}
            onChange={handleChange}
            className={errors.patientName ? "border-red-500" : ""}
          />
          {errors.patientName && (
            <p className="text-xs text-red-500">{errors.patientName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-full border rounded px-3 py-2 text-left text-sm ${
                  errors.dateOfBirth ? "border-red-500" : "border-input"
                }`}
              >
                {formData.dateOfBirth
                  ? format(new Date(formData.dateOfBirth), "dd/MM/yyyy")
                  : "Select date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.dateOfBirth
                    ? new Date(formData.dateOfBirth)
                    : undefined
                }
                onSelect={(date) => {
                  const dateString = date
                    ? date.toISOString().slice(0, 10)
                    : "";
                  setFormData({
                    ...formData,
                    dateOfBirth: dateString,
                  });
                  if (errors.dateOfBirth) {
                    setErrors({
                      ...errors,
                      dateOfBirth: "",
                    });
                  }
                }}
                captionLayout="dropdown"
                fromYear={1950}
                toYear={new Date().getFullYear()}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`flex h-10 w-full rounded-md border ${
              errors.gender ? "border-red-500" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="" disabled>
              Choose your gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-red-500">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="e.g. 0123456789"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={errors.phoneNumber ? "border-red-500" : ""}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. patient@email.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            placeholder="e.g. 123 Đường ABC, Quận 1, TP.HCM"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Update Test Order" : "Create Test Order"}
        </Button>
      </div>
    </form>
  );
}
