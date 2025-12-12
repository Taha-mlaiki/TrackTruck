import { z } from "zod";

export const maintenanceRuleSchema = z.object({
	resourceType: z.enum(["truck", "trailer", "tire"]),
	recourceId: z.string(),
	intervalKm: z.number().int().optional(),
	intervalDays: z.number().int().optional(),
	lastRun: z.date().optional(),
	description: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
