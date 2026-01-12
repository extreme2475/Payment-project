import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    walletPin: {
      type: String,
      required: true, // must be set at registration
    },
    walletBalance: {
      type: Number,
      default: 0, // initial fake money (optional)
    },
    demoWalletBalance: {
      type: Number,
      default: 1000, // initial demo wallet balance on registration
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    pinAttempts: {
      type: Number,
      default: 0, // track consecutive failed PIN attempts
    },
    pinBlocked: {
      type: Boolean,
      default: false, // flag to block transactions if limit exceeded
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ---------------- Optional: helper method to compare PIN ----------------
userSchema.methods.verifyPin = async function (enteredPin, maxAttempts = 3) {
  if (this.pinBlocked) {
    return { success: false, message: "PIN blocked due to multiple failed attempts" };
  }

  const isMatch = await bcrypt.compare(enteredPin, this.walletPin);

  if (!isMatch) {
    this.pinAttempts += 1;
    if (this.pinAttempts >= maxAttempts) {
      this.pinBlocked = true; // block after exceeding max attempts
    }
    await this.save();
    return { success: false, message: "Invalid PIN" };
  }

  // Reset attempts on successful entry
  this.pinAttempts = 0;
  this.pinBlocked = false;
  await this.save();
  return { success: true, message: "PIN verified successfully" };
};

const User = mongoose.model("User", userSchema);

export default User;
