import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { invalidIdResponse, type IdRouteParams } from "@/lib/route-helpers";
import { Item } from "@/models/Item";

export async function PATCH(request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Item");
  if (invalid) return invalid;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.category !== undefined) updates.category = body.category;
  if (body.owner !== undefined) updates.owner = body.owner;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.status !== undefined) updates.status = body.status;
  if (body.order !== undefined) updates.order = body.order;

  await connectToDatabase();
  let item;
  try {
    item = await Item.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
  } catch (err) {
    if (err instanceof mongoose.Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(_request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Item");
  if (invalid) return invalid;

  await connectToDatabase();
  const item = await Item.findByIdAndDelete(id).lean();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
