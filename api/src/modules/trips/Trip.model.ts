import { Schema, model, Document } from "mongoose";

export type TripStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface ITripDoc extends Document {
  reference: string;
  origin: string;
  destination: string;
  plannedStart: Date;
  plannedEnd?: Date;
  truck: typeof Schema.Types.ObjectId;
  trailer?: typeof Schema.Types.ObjectId;
  driver: typeof Schema.Types.ObjectId;
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  fuelConsumedLiters?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITripDoc>({
  reference: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  plannedStart: { type: Date, required: true },
  plannedEnd: Date,
  truck: { type: Schema.Types.ObjectId, ref: "Truck", required: true },
  trailer: { type: Schema.Types.ObjectId, ref: "Trailer" },
  driver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending","in_progress","completed","cancelled"], default: "pending" },
  startOdometer: Number,
  endOdometer: Number,
  fuelConsumedLiters: Number,
  remarks: String
}, { timestamps: true });

export const TripModel = model<ITripDoc>("Trip", TripSchema);
