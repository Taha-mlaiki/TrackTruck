import { Schema, model, Document } from "mongoose";

export interface IFuelDoc extends Document {
  truck: typeof Schema.Types.ObjectId;
  trip?: typeof Schema.Types.ObjectId;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerAtFill: number;
  station?: string;
  fuelType: "diesel" | "gasoline";
  filledBy: typeof Schema.Types.ObjectId;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FuelSchema = new Schema<IFuelDoc>({
  truck: { type: Schema.Types.ObjectId, ref: "Truck", required: true },
  trip: { type: Schema.Types.ObjectId, ref: "Trip" },
  liters: { type: Number, required: true, min: 0 },
  costPerLiter: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  odometerAtFill: { type: Number, required: true, min: 0 },
  station: String,
  fuelType: { type: String, enum: ["diesel", "gasoline"], default: "diesel" },
  filledBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true, default: Date.now },
  notes: String,
}, { timestamps: true });

// Index for efficient queries
FuelSchema.index({ truck: 1, date: -1 });
FuelSchema.index({ filledBy: 1, date: -1 });

export const FuelModel = model<IFuelDoc>("Fuel", FuelSchema);
