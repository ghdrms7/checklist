import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface TripDocument extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

const TripSchema = new Schema<TripDocument>({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Trip: Model<TripDocument> =
  mongoose.models.Trip || mongoose.model<TripDocument>("Trip", TripSchema);
