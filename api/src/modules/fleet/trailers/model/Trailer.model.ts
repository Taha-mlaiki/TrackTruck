import { Schema, model, Document } from "mongoose";

export interface ITrailer extends Document {
  plateNumber: string;
  type: string;
  status: "available" | "in_use" | "maintenance";
  mileage: number;
}

const trailerSchema = new Schema<ITrailer>(
  {
    plateNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "in_use", "maintenance"],
      default: "available",
    },
    mileage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Trailer = model<ITrailer>("Trailer", trailerSchema);
