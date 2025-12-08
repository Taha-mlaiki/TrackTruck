import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  full_name: {
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
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role:{
    type:String,
    enum:["Driver", "Admin"],
    required:true,
    default:"Driver"
  }
});

export const User = mongoose.model("User", userSchema);
