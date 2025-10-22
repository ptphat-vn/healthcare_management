import MonitoringList from '@/components/features/admin/monitoringSevice/MonitoringList';
import React from 'react'

export default function MonitoringServicePage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Monitoring Service</h1>
      </div>
      
      {/* Search */}
      
      {/* Monitoring List */}
      <MonitoringList />
    </div>
  );
}
