import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/schemas/userSchema";
import Input from "@/components/ui/input/Input";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

interface NewUserFormProps {
  onSubmit: (data: CreateUserFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function NewUserForm({
  onSubmit,
  onClose,
  isLoading = false,
}: NewUserFormProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      gender: undefined,
      identifyNumber: "",
      password: "",
      address: "",
    },
  });

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Name */}
          <Input
            {...register("fullName")}
            label="Full name"
            required
            error={errors.fullName?.message}
            placeholder="Enter full name"
            autoComplete="off"
          />
          {/* Email */}
          <Input
            {...register("email")}
            type="email"
            label="Email"
            required
            error={errors.email?.message}
            placeholder="Enter email"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Birthday */}
          <Input
            {...register("dateOfBirth")}
            type="date"
            label="Date of Birth"
            required
            error={errors.dateOfBirth?.message}
          />
          {/* Gender */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Gender
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("gender")}
              defaultValue=""
              className={`flex h-10 w-full rounded-sm border ${
                errors.gender?.message ? "border-red-500" : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="" disabled>
                Choose your gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender?.message && (
              <p className="text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Phone */}
          <Input
            {...register("phone")}
            label="Phone"
            required
            error={errors.phone?.message}
            placeholder="0XXX XXX XXX"
            autoComplete="off"
          />
          {/* CCCD */}
          <Input
            {...register("identifyNumber")}
            label="Identify number"
            required
            error={errors.identifyNumber?.message}
            placeholder="Enter 12-digit ID number"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Password */}
          <Input
            {...register("password")}
            type="password"
            label="Password"
            required
            error={errors.password?.message}
            placeholder="Enter password"
            autoComplete="new-password"
          />
          {/* Address */}
          <Input
            {...register("address")}
            label="Address"
            error={errors.address?.message}
            placeholder="Enter full address (street, city, district, etc.)"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2 w-full sm:w-auto"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`${getRoleButtonClass(
              user?.data.roleCode
            )} w-full sm:w-auto`}
          >
            {isLoading ? "Creating..." : "Add User"}
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
