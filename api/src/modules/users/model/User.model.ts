import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "Driver" | "Admin";

//! why we extended from Dcoument
export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Driver", "Admin"],
      required: true,
      default: "Driver",
    },
    phone: String,
  },
  { timestamps: true }
);


export const User = mongoose.model<IUserDoc>("User", UserSchema);
