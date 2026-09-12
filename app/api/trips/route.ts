import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Trip } from "@/models/Trip";

export async function GET() {
  await connectToDatabase();
  const trips = await Trip.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(trips);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, startDate, endDate } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "name, startDate, endDate are required" },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const trip = await Trip.create({ name, startDate, endDate });
  return NextResponse.json(trip, { status: 201 });
}
