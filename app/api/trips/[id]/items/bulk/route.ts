import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { normalizeItemName } from "@/lib/normalize";
import { invalidIdResponse, type IdRouteParams } from "@/lib/route-helpers";
import { Item } from "@/models/Item";

const MAX_LINES = 200;

export async function POST(request: NextRequest, { params }: IdRouteParams) {
  const { id } = await params;
  const invalid = invalidIdResponse(id, "Trip");
  if (invalid) return invalid;

  const body = await request.json();
  const { text, excludeNames } = body;

  if (typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length > MAX_LINES) {
    return NextResponse.json(
      { error: `A maximum of ${MAX_LINES} lines can be registered at once` },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const existingItems = await Item.find({ tripId: id }, "name").lean();
  const existingNames = new Set(existingItems.map((item) => normalizeItemName(item.name)));

  const duplicates = lines.filter((line) => existingNames.has(normalizeItemName(line)));

  const excludeSet = new Set(
    Array.isArray(excludeNames) ? excludeNames.map((name: string) => normalizeItemName(name)) : []
  );

  const toCreate = lines.filter((line) => !excludeSet.has(normalizeItemName(line)));

  const created = toCreate.length
    ? await Item.insertMany(
        toCreate.map((name, index) => ({
          tripId: id,
          name,
          status: "incomplete",
          order: existingItems.length + index,
        }))
      )
    : [];

  return NextResponse.json(
    {
      created,
      createdCount: created.length,
      duplicates,
      excludedCount: lines.length - toCreate.length,
    },
    { status: 201 }
  );
}
