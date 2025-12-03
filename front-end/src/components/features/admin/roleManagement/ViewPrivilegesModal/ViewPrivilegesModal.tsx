import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import type { Roles } from "@/types/roles.type";
import formatPrivilege from "@/utils/formatPrivilege";

interface ViewPrivilegesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Roles | null;
}

export default function ViewPrivilegesModal({
  open,
  onOpenChange,
  role,
}: ViewPrivilegesModalProps) {
  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader className="space-y-2 pb-3 sm:pb-4 border-b px-1">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 wrap-break-word">
                Role Privileges
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500 mt-1 wrap-break-word">
                View all privileges assigned to {role.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 px-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  Role Name:
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 wrap-break-word text-right sm:text-left">
                  {role.name}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  Role Code:
                </span>
                <span className="text-xs sm:text-sm text-gray-900 wrap-break-word text-right sm:text-left">
                  {role.code}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Privileges:
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 text-right sm:text-left">
                  {role.privileges.length} privilege(s)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Privileges List
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
              {role.privileges.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">
                  No privileges assigned to this role
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {role.privileges.map((privilege, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 sm:p-3 rounded-md bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all min-w-0"
                    >
                      <Badge
                        variant="secondary"
                        className="w-full justify-center text-xs sm:text-sm wrap-break-word"
                      >
                        {formatPrivilege(privilege)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
