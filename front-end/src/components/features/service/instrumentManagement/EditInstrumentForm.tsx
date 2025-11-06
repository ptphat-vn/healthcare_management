import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateInstrumentSchema,
  type UpdateInstrumentFormData,
} from "@/schemas/instrumentSchema";
import Input from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

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
    formState: { errors },
  } = useForm<UpdateInstrumentFormData>({
    resolver: zodResolver(updateInstrumentSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {/* Tên thiết bị */}
        <Input
          {...register("name")}
          label="Tên thiết bị"
          required
          error={errors.name?.message}
          placeholder="Nhập tên thiết bị"
          autoComplete="off"
        />

        {/* Model */}
        <Input
          {...register("model")}
          label="Model"
          required
          error={errors.model?.message}
          placeholder="Nhập model thiết bị"
          autoComplete="off"
        />

        {/* Manufacturer */}
        <Input
          {...register("manufacturer")}
          label="Manufacturer"
          required
          error={errors.manufacturer?.message}
          placeholder="Nhập tên hãng sản xuất"
          autoComplete="off"
        />

        {/* Serial Number */}
        <Input
          {...register("serialNumber")}
          label="SerialNumber"
          required
          error={errors.serialNumber?.message}
          placeholder="Nhập số seri"
          autoComplete="off"
        />

        {/* Location */}
        <Input
          {...register("location")}
          label="Vị trí"
          required
          error={errors.location?.message}
          placeholder="Nhập vị trí"
          autoComplete="off"
        />

        {/* Status */}
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            {...register("status")}
            className="flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Không hoạt động</option>
            <option value="Maintenance">Đang bảo trì</option>
            <option value="Out of Service">Ngưng sử dụng</option>
          </select>
          {errors.status?.message && (
            <p className="text-xs text-red-500">{errors.status.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="col-span-2 space-y-1">
          <label className="text-sm font-medium leading-none">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <Textarea
            {...register("description")}
            placeholder="Nhập mô tả thiết bị"
            className={`min-h-[60px] flex w-full rounded-sm border ${
              errors.description?.message ? "border-red-500" : "border-input"
            } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </form>
  );
}
