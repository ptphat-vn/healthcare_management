import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TestOrderFormProps {
  onSubmit: (formData: TestOrderFormData) => void;
  onCancel: () => void;
  initialData?: TestOrderFormData;
}

export interface TestOrderFormData {
  patientName: string;
  patientDob: string;
  age: string;
  gender: string;
  testType: string;
  priority: string;
}

export default function TestOrderForm({ onSubmit, onCancel, initialData }: TestOrderFormProps) {
  const [formData, setFormData] = useState<TestOrderFormData>(
    initialData || {
      patientName: "",
      patientDob: "",
      age: "",
      gender: "",
      testType: "",
      priority: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name *</Label>
          <Input
            id="patientName"
            name="patientName"
            placeholder="Enter patient name"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientDob">Date of Birth *</Label>
          <Input
            id="patientDob"
            name="patientDob"
            type="date"
            value={formData.patientDob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Enter age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testType">Test Type *</Label>
          <select
            id="testType"
            name="testType"
            value={formData.testType}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select test type</option>
            <option value="Complete Blood Count">Complete Blood Count</option>
            <option value="Lipid Panel">Lipid Panel</option>
            <option value="Thyroid Function">Thyroid Function</option>
            <option value="Liver Function Test">Liver Function Test</option>
            <option value="Kidney Function Panel">Kidney Function Panel</option>
            <option value="Glucose Test">Glucose Test</option>
            <option value="Hemoglobin A1C">Hemoglobin A1C</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select priority</option>
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {initialData ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
