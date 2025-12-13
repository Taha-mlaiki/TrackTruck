import { z } from "zod";

export const maintenanceRuleSchema = z.object({
	resourceType: z.enum(["truck", "trailer", "tire"]),
	resourceId: z.string().min(1, "Resource ID is required"),
	intervalKm: z.number().int().optional(),
	intervalDays: z.number().int().optional(),
	lastRun: z.string().optional().transform((val) => val ? new Date(val) : undefined),
	description: z.string().optional(),
});

export type CreateMaintenanceDTO = z.infer<typeof maintenanceRuleSchema>;
