import { Schema, model, Document } from "mongoose";

export interface IMaintenanceRuleDoc extends Document {
  resourceType: string; // 'truck'|'trailer'|'tire'
  resourceId: Schema.Types.ObjectId; // Reference to the specific truck, trailer, or tire
  intervalKm?: number;
  intervalDays?: number;
  lastRun?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}


const MaintenanceRuleSchema = new Schema<IMaintenanceRuleDoc>({
  resourceType: { type: String, enum: ["truck", "trailer", "tire"], required: true },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceType',
  },
  intervalKm: Number,
  intervalDays: Number,
  lastRun: Date,
  description: String
}, { timestamps: true });

export const MaintenanceRuleModel = model<IMaintenanceRuleDoc>("MaintenanceRule", MaintenanceRuleSchema);
