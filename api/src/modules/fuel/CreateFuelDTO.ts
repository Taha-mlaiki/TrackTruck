import { z } from "zod";

export const createFuelSchema = z.object({
  truckId: z.string().min(1, "Truck is required"),
  tripId: z.string().optional(),
  liters: z.number().positive("Liters must be positive"),
  costPerLiter: z.number().positive("Cost per liter must be positive"),
  odometerAtFill: z.number().min(0, "Odometer must be non-negative"),
  station: z.string().optional(),
  fuelType: z.enum(["diesel", "gasoline"]).default("diesel"),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateFuelSchema = createFuelSchema.partial();

export type CreateFuelDTO = z.infer<typeof createFuelSchema>;
export type UpdateFuelDTO = z.infer<typeof updateFuelSchema>;
