import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { invalidIdResponse, type IdRouteParams } from "@/lib/route-helpers";
import { ItineraryEvent } from "@/models/ItineraryEvent";

export async function PATCH(request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Itinerary event");
  if (invalid) return invalid;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.day !== undefined) updates.day = body.day;
  if (body.dayLabel !== undefined) updates.dayLabel = body.dayLabel;
  if (body.time !== undefined) updates.time = body.time;
  if (body.title !== undefined) updates.title = body.title;
  if (body.location !== undefined) updates.location = body.location;
  if (body.order !== undefined) updates.order = body.order;

  await connectToDatabase();
  let event;
  try {
    event = await ItineraryEvent.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
  } catch (err) {
    if (err instanceof mongoose.Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (!event) {
    return NextResponse.json({ error: "Itinerary event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function DELETE(_request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Itinerary event");
  if (invalid) return invalid;

  await connectToDatabase();
  const event = await ItineraryEvent.findByIdAndDelete(id).lean();

  if (!event) {
    return NextResponse.json({ error: "Itinerary event not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
