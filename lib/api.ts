import type { BulkResult, Item, ItemOwner, ItemPriority, ItineraryEvent, Trip } from "./types";

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const fetcher = (url: string) => fetch(url).then(parseOrThrow);

export function createTrip(input: { name: string; startDate: string; endDate: string }): Promise<Trip> {
  return fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(parseOrThrow);
}

export function deleteTrip(id: string): Promise<null> {
  return fetch(`/api/trips/${id}`, { method: "DELETE" }).then(parseOrThrow);
}

export function createItem(
  tripId: string,
  input: { name: string; category?: string; owner?: ItemOwner; priority?: ItemPriority }
): Promise<Item> {
  return fetch(`/api/trips/${tripId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(parseOrThrow);
}

export function updateItem(
  id: string,
  updates: Partial<Pick<Item, "name" | "category" | "owner" | "priority" | "status" | "order">>
): Promise<Item> {
  return fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }).then(parseOrThrow);
}

export function deleteItem(id: string): Promise<null> {
  return fetch(`/api/items/${id}`, { method: "DELETE" }).then(parseOrThrow);
}

export function bulkCreateItems(
  tripId: string,
  text: string,
  excludeNames?: string[]
): Promise<BulkResult> {
  return fetch(`/api/trips/${tripId}/items/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, excludeNames }),
  }).then(parseOrThrow);
}

export function createItineraryEvent(
  tripId: string,
  input: { day: number; dayLabel: string; time: string; title: string; location?: string }
): Promise<ItineraryEvent> {
  return fetch(`/api/trips/${tripId}/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(parseOrThrow);
}

export function updateItineraryEvent(
  id: string,
  updates: Partial<Pick<ItineraryEvent, "day" | "dayLabel" | "time" | "title" | "location" | "order">>
): Promise<ItineraryEvent> {
  return fetch(`/api/itinerary/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  }).then(parseOrThrow);
}

export function deleteItineraryEvent(id: string): Promise<null> {
  return fetch(`/api/itinerary/${id}`, { method: "DELETE" }).then(parseOrThrow);
}
