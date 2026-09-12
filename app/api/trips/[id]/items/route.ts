import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { invalidIdResponse, type IdRouteParams } from "@/lib/route-helpers";
import { Item } from "@/models/Item";

export async function GET(_request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  await connectToDatabase();
  const items = await Item.find({ tripId: id }).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  const body = await request.json();
  const { name, category, owner, priority } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  await connectToDatabase();
  const item = await Item.create({
    tripId: id,
    name: name.trim(),
    category,
    owner,
    priority,
    status: "incomplete",
  });

  return NextResponse.json(item, { status: 201 });
}
