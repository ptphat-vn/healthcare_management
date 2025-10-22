import { useState, useEffect } from "react";
import Input from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button";
import { type MedicalRecord } from "@/types/medicalRecord.type";

interface EditMedicalRecordFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
  defaultValues: MedicalRecord;
}

export function EditMedicalRecordForm({
  onSubmit,
  onClose,
  isLoading = false,
  defaultValues,
}: EditMedicalRecordFormProps) {
  const [formData, setFormData] = useState({
    // Patient's Information
    name: "",
    phoneNumber: "",
    email: "",
    dob: "",
    gender: "",
    blood: "",
    address: "",
    // Medical Information
    allergy: "",
    chronicDisease: "",
    medication: "",
    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        // Mock data for demo - in real app, this would come from API
        name: "Nguyen Van A",
        phoneNumber: "0395239426",
        email: "vana@gmail.com",
        dob: "26/01/2004",
        gender: "Male",
        blood: "A+",
        address: "123 ABC, Vinhome, Thu Duc",
        allergy: "Penicillin, ABC",
        chronicDisease: "High blood, pressure",
        medication: "Losartan 50mg, Amlodipine 5mg",
        emergencyName: "Nguyen Thi B",
        emergencyRelationship: "Wife",
        emergencyPhone: "0395239425",
      });
    }
  }, [defaultValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient's Information Section */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-1">Patient's Information</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                DOB <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
                  placeholder="DD/MM/YYYY"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Blood</label>
              <div className="relative">
                <select
                  name="blood"
                  value={formData.blood}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-1">Medical Information</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Allery (separated by commas ",")
            </label>
            <input
              type="text"
              name="allergy"
              value={formData.allergy}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Penicillin, ABC"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Chronic Disease (separated by commas ",")
            </label>
            <input
              type="text"
              name="chronicDisease"
              value={formData.chronicDisease}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="High blood, pressure"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Medication in use (separated by commas ",")
            </label>
            <input
              type="text"
              name="medication"
              value={formData.medication}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Losartan 50mg, Amlodipine 5mg"
            />
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-1">Emergency Contact</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Phone number</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="px-4 py-1.5 text-sm">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
