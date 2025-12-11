import { Schema, model, Document } from "mongoose";

export interface ITire extends Document {
  serialNumber: string;
  wearLevel: number;
  status: "new" | "in_use" | "worn_out";
  position?: string;
  assignedTo?: string;
  assignedType?: "truck" | "trailer";
}

const tireSchema = new Schema<ITire>(
  {
    serialNumber: { type: String, required: true, unique: true },
    wearLevel: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ["new", "in_use", "worn_out"],
      default: "new",
    },
    position: { type: String },
    assignedTo: { type: String },
    assignedType: { type: String, enum: ["truck", "trailer"] },
  },
  { timestamps: true }
);

export const TireModel = model<ITire>("Tire", tireSchema);
