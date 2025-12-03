import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { privilegeList } from "@/data/data";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import formatPrivilege from "@/utils/formatPrivilege";
import {
  CreateRoleSchema,
  type CreateRoleFormData,
} from "@/schemas/roleSchema";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/services/roleApi";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import type { Roles } from "@/types/roles.type";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

interface AddRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Roles | null;
}

export default function AddRoleModal({
  open,
  onOpenChange,
  role = null,
}: AddRoleModalProps) {
  const isEditMode = !!role;
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      privileges: [],
    },
  });

  useEffect(() => {
    if (open && role) {
      reset({
        name: role.name,
        code: role.code,
        description: role.description || "",
        privileges: role.privileges || [],
      });
    } else if (open && !role) {
      reset({
        name: "",
        code: "",
        description: "",
        privileges: [],
      });
    }
  }, [open, role, reset]);

  useEffect(() => {
    if (!open) {
      reset();
      setIsLoading(false);
    }
  }, [open, reset]);

  const [isLoading, setIsLoading] = useState(false);
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const selectedPrivileges = watch("privileges") || [];

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      setIsLoading(true);

      if (isEditMode && role) {
        if (!role._id) {
          throw new Error("Role id is missing");
        }
        const result = await updateRole({
          id: role._id,
          ...data,
          description: data.description || "",
        }).unwrap();
        toast.success(result?.message || "Role updated successfully!");
      } else {
        const result = await createRole(data as any).unwrap();
        toast.success(result?.message || "Role created successfully!");
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error saving role:", error);
      const err = error as { data?: { message?: string } };
      toast.error(
        err.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } role. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] rounded-xl sm:w-2xl max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2 pb-3 sm:pb-4 border-b px-1">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 wrap-break-word">
                {isEditMode ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500 mt-1 wrap-break-word">
                {isEditMode
                  ? "Update role information and privileges"
                  : "Define a new role with specific privileges and permissions"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 py-3 sm:py-4 px-1 min-w-0"
        >
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Role Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Laboratory Manager"
                  className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.name ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <Label htmlFor="code" className="text-xs sm:text-sm font-medium">
                  Role Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  {...register("code")}
                  placeholder="e.g., manager"
                  className={`h-9 sm:h-10 text-xs sm:text-sm ${errors.code ? "border-red-500" : ""}`}
                  disabled={isLoading || isEditMode}
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="description" className="text-xs sm:text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of the role and its responsibilities..."
                className="min-h-[70px] sm:min-h-[80px] resize-none text-xs sm:text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Privileges <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-gray-500">
                {selectedPrivileges.length} of {privilegeList.length} selected
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {privilegeList.map((priv) => {
                  const isChecked = selectedPrivileges.includes(priv);
                  return (
                    <label
                      key={priv}
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-md border transition-all cursor-pointer min-w-0 ${
                        isChecked
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newList = checked
                            ? [...selectedPrivileges, priv]
                            : selectedPrivileges.filter((p) => p !== priv);
                          setValue("privileges", newList, {
                            shouldValidate: true,
                          });
                        }}
                        disabled={isLoading}
                        className="shrink-0"
                      />
                      <span
                        className={`text-xs sm:text-sm wrap-break-word min-w-0 ${
                          isChecked
                            ? "font-medium text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {formatPrivilege(priv)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {errors.privileges && (
              <p className="text-xs text-red-500">
                {errors.privileges.message}
              </p>
            )}
          </div>
        </form>

        <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t mt-auto px-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="cursor-pointer text-xs sm:text-sm"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`cursor-pointer text-xs sm:text-sm ${getRoleButtonClass(user?.data.roleCode)}`}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditMode ? "Update Role" : "Create Role"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
