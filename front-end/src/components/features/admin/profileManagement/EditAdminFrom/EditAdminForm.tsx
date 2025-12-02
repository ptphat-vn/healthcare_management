
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/schemas/userSchema";
import Input from "@/components/ui/input/Input";
import { Calendar } from "@/components/ui/calendar";
import { type User } from "@/types/user.type";
import { useEffect } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

interface EditAdminFormProps {
  onSubmit: (data: CreateUserFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
  defaultValues: User;
}

// Schema cho edit user (không có password)
const editUserSchema = createUserSchema.omit({ password: true });
type EditAdminFormData = Omit<CreateUserFormData, "password">;

export function EditAdminForm({
  onSubmit,
  onClose,
  isLoading = false,
  defaultValues,
}: EditAdminFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditAdminFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Set default values when component mounts or defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset({
        fullName: defaultValues.fullName,
        email: defaultValues.email,
        phone: defaultValues.phoneNumber,
        identifyNumber: defaultValues.identifyNumber,
        gender: defaultValues.gender === "male" ? "male" : "female",
        dateOfBirth: defaultValues.dateOfBirth,
        address: defaultValues.address || "",
      });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = (data: EditAdminFormData) => {
    // Add empty password for API compatibility
    onSubmit({ ...data, password: "" });
  };

  return (
    <div className="flex flex-col gap-4 rounded-md p-4 sm:p-6 lg:p-8 font-medium bg-green-50 text-black-800 border border-green-100 w-full max-w-4xl mx-auto">
      <h3 className="text-2xl md:text-3xl text-black font-semibold">
        Edit Profile
      </h3>
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Name */}
          <div className="w-full">
            <Input
              {...register("fullName")}
              label="Full name"
              required
              error={errors.fullName?.message}
              placeholder="Enter full name"
              autoComplete="off"
            />
          </div>
          {/* Email */}
          <div className="w-full">
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
          {/* Gender */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Gender
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("gender")}
              className={`flex h-[42px] w-full rounded-md border ${
                errors.gender?.message
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-300"
              } bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Phone */}
          <div className="w-full">
            <Input
              {...register("phone")}
              label="Phone"
              required
              error={errors.phone?.message}
              placeholder="0XXX XXX XXX"
              autoComplete="off"
            />
          </div>
          {/* CCCD */}
          <div className="w-full">
            <Input
              {...register("identifyNumber")}
              label="Identify number"
              required
              error={errors.identifyNumber?.message}
              placeholder="Enter 12-digit ID number"
              autoComplete="off"
            />
          </div>
          {/* Date of Birth */}
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
                      className={`w-full rounded-md border ${
                        errors.dateOfBirth
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } bg-white px-3 py-2 text-left text-sm flex items-center justify-between ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200`}
                    >
                      <span
                        className={
                          field.value ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {field.value
                          ? format(new Date(field.value), "dd/MM/yyyy")
                          : "Select date"}
                      </span>
                      <CalendarIcon className="h-4 w-4 opacity-50" />
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
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Address */}
          <Input
            {...register("address")}
            label="Address"
            error={errors.address?.message}
            placeholder="Enter full address (street, city, district, etc.)"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
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
            className={`cursor-pointer ${getRoleButtonClass(
              defaultValues.roleCode
            )} h-10 px-4 sm:px-6 w-full sm:w-auto`}
          >
            {isLoading ? "Updating..." : "Update User"}
          </button>
        </div>

        {errors.root?.message && (
          <span className="text-xs text-red-500 wrap-break-word">
            {errors.root?.message}
          </span>
        )}
      </form>
    </div>
  );
}
