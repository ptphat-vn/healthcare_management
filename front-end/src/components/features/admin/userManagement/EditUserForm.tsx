import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/schemas/userSchema";
import Input from "@/components/ui/input/Input";

import { type User } from "@/types/user.type";
import { useEffect } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useGetAllRoleQuery } from "@/services/roleApi";

interface EditUserFormProps {
  onSubmit: (data: EditUserFormData & { password: string }) => void;
  onClose: () => void;
  isLoading?: boolean;
  defaultValues: User;
}

const editUserSchema = createUserSchema.omit({ password: true }).extend({
  roleId: z.string().min(1, "Role is required"),
});
type EditUserFormData = Omit<CreateUserFormData, "password"> & {
  roleId: string;
};

export function EditUserForm({
  onSubmit,
  onClose,
  isLoading = false,
  defaultValues,
}: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  const { data: rolesData } = useGetAllRoleQuery();
  const roles = rolesData?.data?.role || [];

  useEffect(() => {
    if (defaultValues) {
      reset({
        fullName: defaultValues.fullName,
        email: defaultValues.email,
        phone: defaultValues.phoneNumber,
        identifyNumber: defaultValues.identifyNumber,
        gender: defaultValues.gender === "male" ? "Male" : "Female",
        dateOfBirth: defaultValues.dateOfBirth,
        address: defaultValues.address || "",
        roleId: defaultValues.roleId || "",
      });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = (data: EditUserFormData) => {
    onSubmit({ ...data, password: "" });
  };

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-2" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("fullName")}
            label="Full name"
            required
            error={errors.fullName?.message}
            placeholder="Enter full name"
            autoComplete="off"
          />
          <Input
            {...register("email")}
            type="email"
            label="Email"
            required
            error={errors.email?.message}
            placeholder="example@gmail.com"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Date of Birth
              <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full border rounded px-3 py-2 text-left text-sm ${
                        errors.dateOfBirth ? "border-red-500" : "border-input"
                      }`}
                    >
                      {field.value
                        ? format(new Date(field.value), "dd/MM/yyyy")
                        : "Select date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(
                          date ? date.toISOString().slice(0, 10) : ""
                        )
                      }
                      captionLayout="dropdown"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dateOfBirth?.message && (
              <p className="text-xs text-red-500">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Gender
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("gender")}
              className={`flex h-10 w-full rounded-sm border ${
                errors.gender?.message ? "border-red-500" : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="" disabled>
                Choose your gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender?.message && (
              <p className="text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("phone")}
            label="Phone"
            required
            error={errors.phone?.message}
            placeholder="0XXX XXX XXX"
            autoComplete="off"
          />
          <Input
            {...register("identifyNumber")}
            label="Identify number"
            required
            error={errors.identifyNumber?.message}
            placeholder="Enter 12-digit ID number"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Input
            {...register("address")}
            label="Address"
            error={errors.address?.message}
            placeholder="Enter full address (street, city, district, etc.)"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Role
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("roleId")}
              className={`flex h-10 w-full rounded-sm border ${
                errors.roleId?.message ? "border-red-500" : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="" disabled>
                Choose a role
              </option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId?.message && (
              <p className="text-xs text-red-500">{errors.roleId.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            {isLoading ? "Updating..." : "Update User"}
          </button>
        </div>

        {errors.root?.message && (
          <span className="text-xs text-red-500 break-words">
            {errors.root?.message}
          </span>
        )}
      </form>
    </div>
  );
}
