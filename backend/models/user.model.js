import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Admin", "Reviewer"],
      default: "Reviewer",
    },
  },
  { timestamps: true });

  export const UserSchema = mongoose.model("User", userSchema);