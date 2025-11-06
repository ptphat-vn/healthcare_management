import * as z from "zod";

export const createInstrumentSchema = z.object({
  name: z.string().min(1, "Instrument name is required"),
  model: z.string().min(1, "Model is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Active", "Inactive", "Maintenance", "Out of Service"]),
});

export type CreateInstrumentFormData = z.infer<typeof createInstrumentSchema>;

// Schema cho chỉnh sửa thiết bị
export const updateInstrumentSchema = z.object({
  name: z.string().min(1, "Tên thiết bị là bắt buộc"),
  model: z.string().min(1, "Model là bắt buộc"),
  manufacturer: z.string().min(1, "Hãng sản xuất là bắt buộc"),
  serialNumber: z.string().min(1, "Số seri là bắt buộc"),
  location: z.string().min(1, "Vị trí là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  status: z.enum(["Active", "Inactive", "Maintenance", "Out of Service"]),
});

export type UpdateInstrumentFormData = z.infer<typeof updateInstrumentSchema>;
