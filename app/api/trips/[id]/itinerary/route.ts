import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { invalidIdResponse, type IdRouteParams } from "@/lib/route-helpers";
import { ItineraryEvent } from "@/models/ItineraryEvent";

export async function GET(_request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  await connectToDatabase();
  const events = await ItineraryEvent.find({ tripId: id })
    .sort({ day: 1, order: 1, time: 1 })
    .lean();
  return NextResponse.json(events);
}

export async function POST(request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  const body = await request.json();
  const { day, dayLabel, time, title, location } = body;

  if (typeof day !== "number" || !dayLabel || !time || !title) {
    return NextResponse.json(
      { error: "day, dayLabel, time, title are required" },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const count = await ItineraryEvent.countDocuments({ tripId: id, day });
  const event = await ItineraryEvent.create({
    tripId: id,
    day,
    dayLabel,
    time,
    title,
    location,
    order: count,
  });

  return NextResponse.json(event, { status: 201 });
}
