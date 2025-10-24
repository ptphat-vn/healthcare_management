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
        const result = await updateRole({ id: role._id, ...data }).unwrap();
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {isEditMode
                  ? "Update role information and privileges"
                  : "Define a new role with specific privileges and permissions"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto space-y-6 py-4"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Role Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Laboratory Manager"
                  className={errors.name ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Role Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  {...register("code")}
                  placeholder="e.g., manager"
                  className={errors.code ? "border-red-500" : ""}
                  disabled={isLoading || isEditMode}
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of the role and its responsibilities..."
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Privileges <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-gray-500">
                {selectedPrivileges.length} of {privilegeList.length} selected
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                {privilegeList.map((priv) => {
                  const isChecked = selectedPrivileges.includes(priv);
                  return (
                    <label
                      key={priv}
                      className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${
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
                      />
                      <span
                        className={`text-sm ${
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="min-w-[100px] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
