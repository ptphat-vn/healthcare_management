import { AlertCircle, Clock, TrendingUp } from "lucide-react";

export default function SystemAlertsManagement() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          System Alerts (no real data yet :))
        </h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
          View All
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alert 1: Equipment Maintenance */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-3">
            <div className="bg-yellow-500/10 p-2 rounded-lg h-fit">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 mb-1">
                Equipment XYZ-100 needs maintenance
              </p>
              <p className="text-sm text-yellow-700 mb-2">
                Has been running continuously for 720 hours
              </p>
              <div className="flex items-center gap-2 text-xs text-yellow-600">
                <Clock className="h-3 w-3" />
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert 2: Chemical Supply */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-3">
            <div className="bg-amber-500/10 p-2 rounded-lg h-fit">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">
                Reagent A chemical is running low
              </p>
              <p className="text-sm text-amber-700 mb-2">
                15% capacity remaining
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <Clock className="h-3 w-3" />
                <span>5 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
