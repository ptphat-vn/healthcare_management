import { Package, AlertCircle, XCircle, Beaker } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    used: number;
    consumed: number;
    wasted: number;
    expired: number;
    returned: number;
  };
  totalUsage: number;
}

export default function StatsCards({ stats, totalUsage }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Usage</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Used</p>
            <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Consumed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.consumed}
            </p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-lg">
            <Package className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Wasted</p>
            <p className="text-2xl font-bold text-red-600">{stats.wasted}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Expired</p>
            <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <XCircle className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Returned</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.returned}
            </p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Beaker className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
