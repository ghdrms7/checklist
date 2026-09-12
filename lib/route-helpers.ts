import mongoose from "mongoose";
import { NextResponse } from "next/server";

export type IdRouteParams = { params: Promise<{ id: string }> };

/** Returns a 404 response if `id` is not a valid ObjectId, otherwise null. */
export function invalidIdResponse(id: string, label: string): NextResponse | null {
  if (mongoose.isValidObjectId(id)) return null;
  return NextResponse.json({ error: `${label} not found` }, { status: 404 });
}
