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

export const createReagentSchema = z.object({
  name: z.string().min(1, "Reagent name is required"),
  catalogNumber: z.string().min(1, "Catalog number is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  casNumber: z.string().optional(),
  description: z.string().optional(),
  usagePerRun: z
    .object({
      min: z
        .number()
        .int("Min dosage must be an integer")
        .min(0, "Min dosage cannot be negative"),
      max: z
        .number()
        .int("Max dosage must be an integer")
        .min(0, "Max dosage cannot be negative"),
      unit: z.enum(["ml", "μl", "L"], {
        message: "Unit must be ml, μl, or L",
      }),
    })
    .refine((data) => data.min <= data.max, {
      message: "Min dosage cannot be greater than Max dosage",
      path: ["min"],
    }),
  ratio: z.string().min(1, "Dilution ratio is required"),
  categories: z.string().min(1, "Category is required"),
  storageConditions: z.string().min(1, "Storage conditions is required"),
  isActive: z.boolean().optional(),
});

export type CreateReagentFormData = z.infer<typeof createReagentSchema>;

export const updateReagentSchema = z.object({
  name: z.string().min(1, "Reagent name is required"),
  catalogNumber: z.string().min(1, "Catalog number is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  casNumber: z.string().optional(),
  description: z.string().optional(),
  usagePerRun: z
    .object({
      min: z
        .number()
        .int("Min dosage must be an integer")
        .min(0, "Min dosage cannot be negative"),
      max: z
        .number()
        .int("Max dosage must be an integer")
        .min(0, "Max dosage cannot be negative"),
      unit: z.enum(["ml", "μl", "L"], {
        message: "Unit must be ml, μl, or L",
      }),
    })
    .refine((data) => data.min <= data.max, {
      message: "Min dosage cannot be greater than Max dosage",
      path: ["min"],
    }),
  ratio: z.string().min(1, "Dilution ratio is required"),
  categories: z.string().min(1, "Category is required"),
  storageConditions: z.string().min(1, "Storage conditions is required"),
  isActive: z.boolean().optional(),
});

export type UpdateReagentFormData = z.infer<typeof updateReagentSchema>;
