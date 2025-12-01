import { FileText } from "lucide-react";

export default function MedicalRecordHeader() {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Medical Record
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Complete patient health information
          </p>
        </div>
      </div>
    </div>
  );
}

