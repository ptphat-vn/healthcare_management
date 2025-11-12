import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateInstrumentSchema,
  type UpdateInstrumentFormData,
} from "@/schemas/instrumentSchema";
import Input from "@/components/ui/input/Input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

interface EditInstrumentFormProps {
  defaultValues: UpdateInstrumentFormData;
  onSubmit: (data: UpdateInstrumentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EditInstrumentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: EditInstrumentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInstrumentFormData>({
    resolver: zodResolver(updateInstrumentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <div className="flex flex-col gap-1">
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("name")}
            label="Instrument Name"
            required
            error={errors.name?.message}
            placeholder="Enter instrument name"
            autoComplete="off"
          />
          <Input
            {...register("model")}
            label="Model"
            required
            error={errors.model?.message}
            placeholder="Enter model"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("manufacturer")}
            label="Manufacturer"
            required
            error={errors.manufacturer?.message}
            placeholder="Enter manufacturer"
            autoComplete="off"
          />
          <Input
            {...register("serialNumber")}
            label="Serial Number"
            required
            error={errors.serialNumber?.message}
            placeholder="Enter serial number"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register("location")}
            label="Location"
            required
            error={errors.location?.message}
            placeholder="Enter location"
            autoComplete="off"
          />
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Status
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status")}
              className={`flex h-10 w-full rounded-sm border ${errors.status?.message ? "border-red-500" : "border-input"
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
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description 
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register("description")}
              placeholder="Enter description"
              className={`min-h-[80px] flex w-full rounded-sm border ${errors.description?.message ? "border-red-500" : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            />
            {errors.description?.message && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            {isLoading ? "Updating..." : "Update Instrument"}
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
