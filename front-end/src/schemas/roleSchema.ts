import * as z from "zod";

export const CreateRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  code: z.string().min(2, "Role code is required"),
  description: z.string().optional(),
  privileges: z.array(z.string()).min(1, "Select at least one privilege"),
});

export type CreateRoleFormData = z.infer<typeof CreateRoleSchema>;
