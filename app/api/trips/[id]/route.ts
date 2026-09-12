import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { invalidIdResponse, type IdRouteParams } from "@/lib/route-helpers";
import { Trip } from "@/models/Trip";
import { Item } from "@/models/Item";
import { ItineraryEvent } from "@/models/ItineraryEvent";

export async function GET(_request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  await connectToDatabase();
  const trip = await Trip.findById(id).lean();

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PATCH(request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.startDate !== undefined) updates.startDate = body.startDate;
  if (body.endDate !== undefined) updates.endDate = body.endDate;

  await connectToDatabase();
  let trip;
  try {
    trip = await Trip.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
  } catch (err) {
    if (err instanceof mongoose.Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function DELETE(_request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  await connectToDatabase();

  const trip = await Trip.findByIdAndDelete(id).lean();

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  await Item.deleteMany({ tripId: id });
  await ItineraryEvent.deleteMany({ tripId: id });

  return new NextResponse(null, { status: 204 });
}
