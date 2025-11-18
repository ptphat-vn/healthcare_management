import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInstrumentSchema,
  type CreateInstrumentFormData,
  REAGENT_CATEGORIES,
} from "@/schemas/instrumentSchema";
import Input from "@/components/ui/input/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { getRoleButtonClass } from "@/utils/getRoleButtonClass";

interface NewInstrumentFormProps {
  onSubmit: (data: CreateInstrumentFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function NewInstrumentForm({
  onSubmit,
  onClose,
  isLoading = false,
}: NewInstrumentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateInstrumentFormData>({
    resolver: zodResolver(createInstrumentSchema),
    defaultValues: {
      name: "",
      model: "",
      manufacturer: "",
      serialNumber: "",
      location: "",
      description: "",
      status: "Active",
      categories: [],
    },
  });
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          {/* Instrument Name */}
          <Input
            {...register("name")}
            label="Instrument Name"
            required
            error={errors.name?.message}
            placeholder="e.g. Blood Analyzer Model X-100"
            autoComplete="off"
          />
          {/* Model */}
          <Input
            {...register("model")}
            label="Model"
            error={errors.model?.message}
            placeholder="e.g. X-100"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Manufacturer */}
          <Input
            {...register("manufacturer")}
            label="Manufacturer"
            error={errors.manufacturer?.message}
            placeholder="e.g. ABC Medical Devices"
            autoComplete="off"
          />
          {/* Serial Number */}
          <Input
            {...register("serialNumber")}
            label="Serial Number"
            error={errors.serialNumber?.message}
            placeholder="e.g. SN-2024-001"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Location */}
          <Input
            {...register("location")}
            label="Location"
            error={errors.location?.message}
            placeholder="e.g. Lab Room A, Shelf 1"
            autoComplete="off"
          />
          {/* Status */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Status
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status")}
              className={`flex h-10 w-full rounded-sm border ${
                errors.status?.message ? "border-red-500" : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
            {errors.status?.message && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Description */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="e.g. Automated blood analysis instrument"
              rows={3}
              className={`flex w-full rounded-sm border ${
                errors.description?.message ? "border-red-500" : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            />
            {errors.description?.message && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none">
              Categories <span className="text-red-500">*</span>
            </label>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                  {REAGENT_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={field.value?.includes(category)}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...(field.value || []), category]
                            : field.value?.filter((c) => c !== category) || [];
                          field.onChange(updatedValue);
                        }}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.categories?.message && (
              <p className="text-xs text-red-500">
                {errors.categories.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={getRoleButtonClass(user?.data.roleCode)}
          >
            {isLoading ? "Creating..." : "Add Instrument"}
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
