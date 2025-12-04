import {
  FlaskConical,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllInstrumentsQuery } from "@/services/instrumentApi";
import {
  useGetAllReagentsQuery,
  useGetReagentInventoryFIFOQuery,
} from "@/services/reagentApi";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";
import { useMemo, useCallback } from "react";
import { formatDate } from "@/utils/formatDate";
import { useNavigate } from "react-router-dom";

export default function ServiceDashboard() {
  const navigate = useNavigate();

  const buildNavigationHandler = useCallback(
    (path: string) => () => {
      navigate(path);
    },
    [navigate]
  );

  const quickActions = useMemo(
    () => [
      {
        title: "Add Instrument",
        description: "Register new equipment and assign responsibility",
        icon: Wrench,
        gradient: "from-blue-500 via-blue-600 to-blue-700",
        path: "/service/instruments",
      },
      {
        title: "Add Reagent",
        description: "Update reagent catalog and usage data",
        icon: FlaskConical,
        gradient: "from-purple-500 via-purple-600 to-indigo-600",
        path: "/service/reagent-management",
      },
      {
        title: "Inventory Board",
        description: "Review stock levels and FIFO batches",
        icon: Package,
        gradient: "from-emerald-500 via-emerald-600 to-lime-600",
        path: "/service/inventory-management",
      },
      {
        title: "Maintenance Log",
        description: "Track upcoming and in-progress services",
        icon: Clock,
        gradient: "from-amber-500 via-orange-600 to-red-600",
        path: "/service/instruments",
      },
      {
        title: "Calibration Planner",
        description: "Schedule calibration windows with labs",
        icon: TrendingUp,
        gradient: "from-sky-500 via-cyan-600 to-blue-700",
        path: "/service/instruments",
      },
      {
        title: "Profile & Alerts",
        description: "Edit contact info and notification rules",
        icon: CheckCircle2,
        gradient: "from-gray-600 via-slate-700 to-gray-900",
        path: "/service/profile",
      },
    ],
    []
  );

  // API Queries
  const {
    data: instrumentsData,
    isLoading: isLoadingInstruments,
    isError: isErrorInstruments,
  } = useGetAllInstrumentsQuery({ limit: 1000 });

  const {
    data: reagentsData,
    isLoading: isLoadingReagents,
    isError: isErrorReagents,
  } = useGetAllReagentsQuery({ limit: 1000 });

  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
    isError: isErrorInventory,
  } = useGetReagentInventoryFIFOQuery({
    page: 1,
    limit: 1000,
  });

  // Calculate stats from API data
  const stats = useMemo(() => {
    const instruments = instrumentsData?.data?.instruments || [];
    const reagents = reagentsData?.data?.reagents || [];
    const totalInstruments = instruments.length;
    const activeInstruments = instruments.filter(
      (inst) => inst.status === "Active" || inst.isActive
    ).length;
    const maintenanceInstruments = instruments.filter(
      (inst) => inst.status === "Maintenance"
    ).length;

    // Calculate change for instruments (this month)
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const instrumentsThisMonth = instruments.filter((inst) => {
      if (!inst.createdAt) return false;
      const createdDate = new Date(inst.createdAt);
      return (
        createdDate.getMonth() === thisMonth &&
        createdDate.getFullYear() === thisYear
      );
    }).length;

    // Calculate change for reagents (this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const reagentsThisWeek = reagents.filter((reagent) => {
      if (!reagent.createdAt) return false;
      return new Date(reagent.createdAt) >= oneWeekAgo;
    }).length;

    return [
      {
        title: "Total Instruments",
        value: totalInstruments.toString(),
        icon: <Wrench className="w-6 h-6" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        change:
          instrumentsThisMonth > 0
            ? `+${instrumentsThisMonth} this month`
            : "No new instruments",
      },
      {
        title: "Active Instruments",
        value: activeInstruments.toString(),
        icon: <CheckCircle2 className="w-6 h-6" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        change:
          totalInstruments > 0
            ? `${Math.round(
                (activeInstruments / totalInstruments) * 100
              )}% operational`
            : "No instruments",
      },
      {
        title: "Maintenance Due",
        value: maintenanceInstruments.toString(),
        icon: <AlertTriangle className="w-6 h-6" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        change:
          maintenanceInstruments > 0 ? "Need attention" : "All operational",
      },
      {
        title: "Total Reagents",
        value: reagents.length.toString(),
        icon: <FlaskConical className="w-6 h-6" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        change:
          reagentsThisWeek > 0
            ? `+${reagentsThisWeek} this week`
            : "No new reagents",
      },
    ];
  }, [instrumentsData, reagentsData]);

  // Get recent maintenance activities
  const recentMaintenances = useMemo(() => {
    const instruments = instrumentsData?.data?.instruments || [];
    return instruments
      .filter((inst) => {
        return (
          inst.status === "Maintenance" ||
          inst.lastMaintenanceDate ||
          inst.nextMaintenanceDate
        );
      })
      .sort((a, b) => {
        // Sort by lastMaintenanceDate or updatedAt
        const dateA = a.lastMaintenanceDate
          ? new Date(a.lastMaintenanceDate).getTime()
          : a.updatedAt
          ? new Date(a.updatedAt).getTime()
          : 0;
        const dateB = b.lastMaintenanceDate
          ? new Date(b.lastMaintenanceDate).getTime()
          : b.updatedAt
          ? new Date(b.updatedAt).getTime()
          : 0;
        return dateB - dateA;
      })
      .slice(0, 4)
      .map((inst) => ({
        id: inst._id,
        instrument: inst.name,
        type:
          inst.status === "Maintenance"
            ? "Maintenance"
            : inst.nextMaintenanceDate
            ? "Scheduled"
            : "Inspection",
        date: inst.lastMaintenanceDate
          ? formatDate(inst.lastMaintenanceDate)
          : inst.updatedAt
          ? formatDate(inst.updatedAt)
          : "N/A",
        status:
          inst.status === "Maintenance"
            ? "In Progress"
            : inst.nextMaintenanceDate
            ? "Scheduled"
            : "Completed",
        technician: inst.responsiblePerson || inst.responsiblePersonId || "N/A",
      }));
  }, [instrumentsData]);

  // Get low stock reagents
  const lowStockReagents = useMemo(() => {
    const inventory = inventoryData?.data?.inventory || [];
    const reagents = reagentsData?.data?.reagents || [];

    const lowStockItems = inventory
      .filter((item) => {
        // Find the reagent to get min stock info
        const reagent = reagents.find((r) => r._id === item.reagentId);
        // If we have usagePerRun, we can estimate min stock
        const minStock = reagent?.usagePerRun?.max
          ? reagent.usagePerRun.max * 2
          : 20; // Default threshold
        return item.quantityAvailable < minStock && item.quantityAvailable > 0;
      })
      .sort((a, b) => a.quantityAvailable - b.quantityAvailable)
      .slice(0, 3)
      .map((item) => {
        const reagent = reagents.find((r) => r._id === item.reagentId);
        const minStock = reagent?.usagePerRun?.max
          ? reagent.usagePerRun.max * 2
          : 20;
        return {
          id: item.reagentId,
          name: item.reagentName,
          currentStock: item.quantityAvailable,
          minStock: minStock,
          unit: item.unitOfMeasure || "units",
          expiryDate: formatDate(item.expirationDate),
        };
      });

    return lowStockItems;
  }, [inventoryData, reagentsData]);

  // Loading state
  const isLoading =
    isLoadingInstruments || isLoadingReagents || isLoadingInventory;

  // Error state
  const isError = isErrorInstruments || isErrorReagents || isErrorInventory;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white rounded-2xl">
        <LoadingSpinner message="Loading dashboard data..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 sm:space-y-6 bg-white min-h-screen rounded-2xl p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">
            Error loading dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in progress":
        return "bg-blue-100 text-blue-700";
      case "scheduled":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-white min-h-screen rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Service Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage instruments and reagents inventory
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`${stat.bgColor} ${stat.color} p-2 sm:p-3 rounded-lg`}
                >
                  {stat.icon}
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Maintenance Activities */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Maintenance
              </CardTitle>
              <Button
                variant="link"
                className="text-xs sm:text-sm text-blue-600"
                onClick={buildNavigationHandler("/service/instruments")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Instrument</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMaintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell className="text-xs sm:text-sm font-medium">
                        {maintenance.instrument}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-gray-600">
                        {maintenance.type}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {maintenance.date}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${getStatusColor(
                            maintenance.status
                          )}`}
                        >
                          {maintenance.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Reagents */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Low Stock Reagents
              </CardTitle>
              <Button
                variant="link"
                className="text-xs sm:text-sm text-blue-600"
                onClick={buildNavigationHandler("/service/reagent-management")}
              >
                Reorder
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {lowStockReagents.map((reagent) => (
                <div
                  key={reagent.id}
                  className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                        {reagent.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {reagent.currentStock} {reagent.unit}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Min: {reagent.minStock}
                        </span>
                      </div>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>Expires: {reagent.expiryDate}</span>
                  </div>
                  <Button
                    size="sm"
                    className="btn-service w-full mt-3 text-xs"
                    onClick={() => navigate(`/service/inventory-management`)}
                  >
                    Order Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={buildNavigationHandler(action.path)}
                  className="relative overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${action.gradient} opacity-90 transition-opacity duration-200 hover:opacity-100`}
                  />
                  <div className="relative flex h-full flex-col gap-3 rounded-2xl p-4 sm:p-5 text-left text-white">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                        Go
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{action.title}</p>
                      <p className="text-xs text-white/80 mt-1 leading-snug">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
