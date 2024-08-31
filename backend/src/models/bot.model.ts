import mongoose, { Schema } from "mongoose";

const botSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      unique: [true, "Phone Number Already Registreted"],
      required: [true, "Required"],
    },
    sessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Bot = mongoose.model("Bot", botSchema);
