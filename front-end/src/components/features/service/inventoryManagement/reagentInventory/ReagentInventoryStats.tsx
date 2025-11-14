import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";

interface ReagentInventoryStatsProps {
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    expiringSoon: number;
  };
}

export default function ReagentInventoryStats({
  stats,
}: ReagentInventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Items</p>
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
            <p className="text-xs sm:text-sm text-gray-600">In Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">
              {stats.inStock}
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
            <p className="text-xs sm:text-sm text-gray-600">Low Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">
              {stats.lowStock}
            </p>
          </div>
          <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Out of Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {stats.outOfStock}
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
            <p className="text-xs sm:text-sm text-gray-600">Expiring Soon</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {stats.expiringSoon}
            </p>
          </div>
          <div className="bg-amber-100 p-2 sm:p-3 rounded-lg">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
