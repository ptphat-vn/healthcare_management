import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/schemas/userSchema";
import Input from "@/components/ui/input/Input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { type User } from "@/types/user.type";
import { Button } from "@/components/ui/button";

interface EditPatientFormProps {
  onSubmit: (data: CreateUserFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
  defaultValues: User;
}

const editPatientSchema = createUserSchema.omit({ password: true });
type EditPatientFormData = Omit<CreateUserFormData, "password">;

export function EditPatientForm({
  onSubmit,
  onClose,
  isLoading = false,
  defaultValues,
}: EditPatientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

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

  const handleFormSubmit = (data: EditPatientFormData) => {
    onSubmit({ ...data, password: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 px-3 py-4 sm:px-6 sm:py-6">
      <div className="w-full max-w-lg sm:max-w-2xl mx-auto">
        <div className="relative rounded-xl sm:rounded-2xl bg-white shadow-2xl">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 rounded-full border border-gray-200 bg-white p-1.5 sm:p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-5 sm:mb-6 space-y-2 text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                Patient Profile
              </p>
              <h3 className="text-2xl font-semibold text-gray-900">
                Update personal information
              </h3>
              <p className="text-sm text-gray-500">
                Keep your contact and demographic details up to date for better
                care coordination.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <Input
                  {...register("fullName")}
                  label="Full name"
                  required
                  error={errors.fullName?.message}
                  placeholder="Enter full name"
                  autoComplete="off"
                  className="h-10 py-1.5 text-sm"
                />

                <Input
                  {...register("email")}
                  type="email"
                  label="Email"
                  required
                  error={errors.email?.message}
                  placeholder="example@gmail.com"
                  autoComplete="off"
                  className="h-10 py-1.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("gender")}
                    className={`flex h-10 w-full rounded-sm border ${
                      errors.gender ? "border-red-500" : "border-gray-200"
                    } bg-white px-3 text-sm text-gray-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                  >
                    <option value="" disabled>
                      Choose your gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender?.message && (
                    <p className="text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <Input
                  {...register("phone")}
                  label="Phone"
                  required
                  error={errors.phone?.message}
                  placeholder="0XXX XXX XXX"
                  autoComplete="off"
                  className="h-10 py-1.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <Input
                  {...register("identifyNumber")}
                  label="Identify number"
                  required
                  error={errors.identifyNumber?.message}
                  placeholder="Enter 12-digit ID number"
                  autoComplete="off"
                  className="h-10 py-1.5 text-sm"
                />

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Date of Birth<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={`flex h-10 w-full items-center justify-between rounded-sm border ${
                              errors.dateOfBirth
                                ? "border-red-500"
                                : "border-gray-200"
                            } bg-white px-3 text-left text-sm text-gray-700 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
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
                            <CalendarIcon className="h-4 w-4 opacity-60" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
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

              <Input
                {...register("address")}
                label="Address"
                error={errors.address?.message}
                placeholder="Street, district, city"
                autoComplete="off"
                className="h-10 py-1.5 text-sm"
              />

              {errors.root?.message && (
                <span className="text-xs text-red-500">
                  {errors.root?.message}
                </span>
              )}

              <div className="flex flex-row justify-end gap-2.5 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="cursor-pointer rounded-md border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="sm"
                  className="ml-1 cursor-pointer rounded-md bg-rose-500 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
