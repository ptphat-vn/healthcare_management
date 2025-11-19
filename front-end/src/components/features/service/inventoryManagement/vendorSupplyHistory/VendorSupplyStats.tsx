import { Package, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

interface VendorSupplyStatsProps {
  stats: {
    total: number;
    received: number;
    pending: number;
    cancelled: number;
    totalQuantity: number;
  };
}

export default function VendorSupplyStats({ stats }: VendorSupplyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Supplies</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {stats.total}
            </p>
          </div>
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Received</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">
              {stats.received}
            </p>
          </div>
          <div className="bg-emerald-100 p-2 sm:p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-amber-100 p-2 sm:p-3 rounded-lg">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Cancelled</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {stats.cancelled}
            </p>
          </div>
          <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Quantity</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {stats.totalQuantity}
            </p>
          </div>
          <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
