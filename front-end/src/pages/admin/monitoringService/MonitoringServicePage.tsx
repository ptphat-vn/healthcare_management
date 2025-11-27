import MonitoringList from "@/components/features/admin/monitoringSevice/MonitoringList/MonitoringList";

export default function MonitoringServicePage() {
  return (
    <div className="p-4 bg-white min-h-screen rounded-[20px]">
      <div className="flex flex-col mb-5">
        <h1 className="text-3xl font-bold text-gray-900">
          Event Log Management
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage all event logs in your system.
        </p>
      </div>

      {/* Search */}

      {/* Monitoring List */}
      <MonitoringList />
    </div>
  );
}
