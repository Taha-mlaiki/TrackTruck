import { z } from "zod";

export const CreateTripSchema = z.object({
  reference: z.string().min(3),
  origin: z.string(),
  destination: z.string(),
  plannedStart: z.string().refine(val => !Number.isNaN(Date.parse(val)), "Invalid date"),
  truckId: z.string().min(1),
  trailerId: z.string().optional(),
  driverId: z.string().min(1)
});

export type CreateTripDTO = z.infer<typeof CreateTripSchema>;
