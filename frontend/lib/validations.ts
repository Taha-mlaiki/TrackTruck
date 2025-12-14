import { z } from "zod";

// ==================== Auth ====================
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ==================== Users ====================
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Driver"]).optional(),
  phone: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ==================== Trucks ====================
export const createTruckSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  modelName: z.string().min(1, "Model name is required"),
  make: z.string().optional(),
  year: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1900 && Number(val) <= new Date().getFullYear() + 1),
      "Invalid year"
    ),
  odometerKm: z
    .string()
    .min(1, "Odometer is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Odometer must be a positive number"),
  fuelCapacity: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Fuel capacity must be a positive number"),
  isActive: z.boolean().optional(),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;

// ==================== Trailers ====================
export const createTrailerSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  type: z.string().min(1, "Type is required"),
  status: z.enum(["available", "in_use", "maintenance"]).optional(),
  mileage: z
    .string()
    .min(1, "Mileage is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Mileage must be a positive number"),
});

export type CreateTrailerInput = z.infer<typeof createTrailerSchema>;

// ==================== Tires ====================
export const createTireSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  wearLevel: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      "Wear level must be between 0 and 100"
    ),
  status: z.enum(["new", "in_use", "worn_out"]).optional(),
  position: z.string().optional(),
});

export type CreateTireInput = z.infer<typeof createTireSchema>;

// ==================== Trips ====================
export const createTripSchema = z.object({
  reference: z.string().min(3, "Reference must be at least 3 characters"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  plannedStart: z.string().min(1, "Planned start date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    "Invalid date"
  ),
  plannedEnd: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
  truckId: z.string().min(1, "Truck is required"),
  trailerId: z.string().optional(),
  driverId: z.string().min(1, "Driver is required"),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

// ==================== Maintenance ====================
export const createMaintenanceSchema = z.object({
  resourceType: z.enum(["truck", "trailer", "tire"], {
    message: "Please select a resource type",
  }),
  resourceId: z.string().min(1, "Please select a resource"),
  intervalKm: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Must be a positive number"),
  intervalDays: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Must be a positive number"),
  description: z.string().optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

// ==================== Validation Helper ====================
export type ValidationErrors = Record<string, string>;

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationErrors } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationErrors = {};
  
  // Zod uses 'issues' not 'errors'
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".") || "general";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}
