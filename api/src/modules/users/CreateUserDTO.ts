import * as z from "zod";



export const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Admin", "Driver"]).optional(),
  phone: z.string().optional()
});

//!  why we did this

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;