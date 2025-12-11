import { z } from "zod";

export const createTruckSchema = z.object({
  plateNumber: z.string().min(1),
  modelName: z.string().min(1),
  make: z.string().optional(),
  year: z.number().int().optional(),
  odometerKm: z.number().int().min(0),
  fuelCapacity: z.number().optional(),
  tires: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  assignedTo: z.string().optional(),
});

export const updateTruckSchema = createTruckSchema.partial();

export const createTrailerSchema = z.object({
  plateNumber: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(["available", "in_use", "maintenance"]).optional(),
  mileage: z.number().int().min(0),
});

export const updateTrailerSchema = createTrailerSchema.partial();

export const createTireSchema = z.object({
  serialNumber: z.string().min(1),
  wearLevel: z.number().int().min(0).max(100),
  status: z.enum(["new", "in_use", "worn_out"]).optional(),
  position: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedType: z.enum(["truck", "trailer"]).optional(),
});

export const updateTireSchema = createTireSchema.partial();
