/** Normalizes an item name for case/whitespace-insensitive comparison. */
export function normalizeItemName(name: string): string {
  return name.trim().toLowerCase();
}
