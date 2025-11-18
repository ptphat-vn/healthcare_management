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

export default function ServiceDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Instruments",
      value: "24",
      icon: <Wrench className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+2 this month",
    },
    {
      title: "Active Instruments",
      value: "20",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "83% operational",
    },
    {
      title: "Maintenance Due",
      value: "4",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "Need attention",
    },
    {
      title: "Total Reagents",
      value: "156",
      icon: <FlaskConical className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+12 this week",
    },
  ];

  const recentMaintenances = [
    {
      id: 1,
      instrument: "Hematology Analyzer XN-1000",
      type: "Preventive Maintenance",
      date: "2025-11-10",
      status: "Completed",
      technician: "John Smith",
    },
    {
      id: 2,
      instrument: "Chemistry Analyzer AU5800",
      type: "Calibration",
      date: "2025-11-09",
      status: "Completed",
      technician: "Sarah Johnson",
    },
    {
      id: 3,
      instrument: "PCR Machine QuantStudio",
      type: "Repair",
      date: "2025-11-08",
      status: "In Progress",
      technician: "Mike Davis",
    },
    {
      id: 4,
      instrument: "Centrifuge Z326K",
      type: "Inspection",
      date: "2025-11-11",
      status: "Scheduled",
      technician: "Emily Wilson",
    },
  ];

  const lowStockReagents = [
    {
      id: 1,
      name: "Hemoglobin Reagent Kit",
      currentStock: 12,
      minStock: 20,
      unit: "kits",
      expiryDate: "2025-12-15",
    },
    {
      id: 2,
      name: "Glucose Oxidase Solution",
      currentStock: 8,
      minStock: 15,
      unit: "bottles",
      expiryDate: "2025-11-30",
    },
    {
      id: 3,
      name: "PCR Master Mix",
      currentStock: 5,
      minStock: 10,
      unit: "tubes",
      expiryDate: "2026-01-20",
    },
  ];

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
        <div className="flex gap-2 sm:gap-3">
          <Button className="btn-service flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>Schedule Maintenance</span>
          </Button>
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
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>Expires: {reagent.expiryDate}</span>
                  </div>
                  <Button size="sm" className="btn-service w-full mt-3 text-xs">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 sm:h-24 gap-2"
            >
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs">Add Instrument</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 sm:h-24 gap-2"
            >
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs">Add Reagent</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 sm:h-24 gap-2"
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs">Schedule</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 sm:h-24 gap-2"
            >
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs">Calibrate</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 sm:h-24 gap-2"
            >
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs">Inventory</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 sm:h-24 gap-2"
            >
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs">Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
