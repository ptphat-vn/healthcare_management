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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Role Privileges
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                View all privileges assigned to {role.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Role Name:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {role.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Role Code:
                </span>
                <span className="text-sm text-gray-900">{role.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Total Privileges:
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {role.privileges.length} privilege(s)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Privileges List
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {role.privileges.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No privileges assigned to this role
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {role.privileges.map((privilege, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-md bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                      <Badge
                        variant="secondary"
                        className="w-full justify-center"
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
