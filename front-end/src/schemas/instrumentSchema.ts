import * as z from "zod";

export const REAGENT_CATEGORIES = [
  "Hematology",
  "Biochemistry",
  "Immunology",
  "Molecular/PCR",
  "Microbiology",
  "Coagulation",
  "Enzyme",
] as const;

export type ReagentCategory = (typeof REAGENT_CATEGORIES)[number];

export const createInstrumentSchema = z.object({
  name: z.string().min(1, "Instrument name is required"),
  model: z.string().min(1, "Model is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Active", "Inactive", "Maintenance", "Out of Service"]),
  categories: z
    .array(z.enum(REAGENT_CATEGORIES))
    .min(1, "At least one category is required"),
});

export type CreateInstrumentFormData = z.infer<typeof createInstrumentSchema>;

// Schema for editing instrument
export const updateInstrumentSchema = z.object({
  name: z.string().min(1, "Instrument name is required"),
  model: z.string().min(1, "Model is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Active", "Inactive", "Maintenance", "Out of Service"]),
  categories: z
    .array(z.enum(REAGENT_CATEGORIES))
    .min(1, "At least one category is required"),
});

export type UpdateInstrumentFormData = z.infer<typeof updateInstrumentSchema>;
