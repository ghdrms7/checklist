import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface ItineraryEventDocument extends Document {
  tripId: Types.ObjectId;
  day: number;
  dayLabel: string;
  time: string;
  title: string;
  location?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryEventSchema = new Schema<ItineraryEventDocument>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    day: { type: Number, required: true },
    dayLabel: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ItineraryEvent: Model<ItineraryEventDocument> =
  mongoose.models.ItineraryEvent ||
  mongoose.model<ItineraryEventDocument>("ItineraryEvent", ItineraryEventSchema);
