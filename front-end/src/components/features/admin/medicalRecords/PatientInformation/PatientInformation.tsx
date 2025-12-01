import { User } from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
}

interface PatientInformationProps {
  patient: Patient;
}

export default function PatientInformation({ patient }: PatientInformationProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Patient ID:</span>
            <span className="text-sm font-semibold text-gray-900">#{patient.id}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Full Name:</span>
            <span className="text-sm font-semibold text-gray-900">{patient.fullName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <a 
              href={`mailto:${patient.email}`}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {patient.email}
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
            <span className="text-sm font-semibold text-gray-900">{patient.dateOfBirth}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Gender:</span>
            <span className="text-sm font-semibold text-gray-900">{patient.gender}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Phone:</span>
            <span className="text-sm font-semibold text-gray-900">{patient.phone}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Address:</span>
            <span className="text-sm font-semibold text-gray-900">{patient.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
