import { Schema, model, Document } from "mongoose";

export interface ITruckDoc extends Document {
  plateNumber: string;
  modelName: string;
  make?: string;
  year?: number;
  odometerKm: number;
  fuelCapacity?: number;
  tires: string[];
  isActive: boolean;
  assignedTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TruckSchema = new Schema<ITruckDoc>({
  plateNumber: { type: String, required: true, unique: true },
  modelName: { type: String, required: true },
  make: String,
  year: Number,
  odometerKm: { type: Number, default: 0 },
  fuelCapacity: Number,
  tires: [{ type: Schema.Types.ObjectId, ref: "Tire" }],
  isActive: { type: Boolean, default: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export const TruckModel = model<ITruckDoc>("Truck", TruckSchema);
