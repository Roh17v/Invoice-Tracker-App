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

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
  });
  
  userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
      { _id: this._id, email: this.email, role: this.role },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );
    return token;
  };

  export const UserSchema = mongoose.model("User", userSchema);