import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Define constants for default values (adjust as needed)
const DEFAULT_AVATAR_URL = "/DefaultAvatar.png";
const VERIFICATION_CODE_EXPIRY_TIME = 60 * 60 * 1000; // 20 minutes in milliseconds

// Define the User interface
export interface IUser extends Document {
  avatar: {
    url: string;
    localPath: string;
  };
  username: string;
  email: string;
  role: string;
  password: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateVerificationCode(): {
    unHashedCode: string;
    hashedCode: string;
    expiry: Date;
  };
}

// Define the User schema
const userSchema: Schema<IUser> = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: DEFAULT_AVATAR_URL,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"], // Define roles here or import as needed
      default: "USER",
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Pre-save middleware for hashing passwords
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if the password is correct
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Method to generate verification code
userSchema.methods.generateVerificationCode = function () {
  const unHashedCode = crypto.randomBytes(3).toString("hex"); // 6-character alphanumeric code
  const hashedCode = crypto
    .createHash("sha256")
    .update(unHashedCode)
    .digest("hex");
  const expiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_TIME); // 20 minutes from now

  // Set the hashed code and expiry in the schema
  this.verificationCode = hashedCode;
  this.verificationCodeExpiry = expiry;

  return { unHashedCode, hashedCode, expiry };
};

// Create and export the User model
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
