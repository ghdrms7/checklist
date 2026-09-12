import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type ItemStatus = "incomplete" | "complete";
export type ItemPriority = "high" | "medium" | "low";
export type ItemOwner = "parent" | "baby";

export interface ItemDocument extends Document {
  tripId: Types.ObjectId;
  name: string;
  category?: string;
  owner: ItemOwner;
  priority?: ItemPriority;
  status: ItemStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    owner: { type: String, enum: ["parent", "baby"], default: "parent" },
    priority: { type: String, enum: ["high", "medium", "low"] },
    status: { type: String, enum: ["incomplete", "complete"], default: "incomplete" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Item: Model<ItemDocument> =
  mongoose.models.Item || mongoose.model<ItemDocument>("Item", ItemSchema);
