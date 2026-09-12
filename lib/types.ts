export type ItemStatus = "incomplete" | "complete";
export type ItemPriority = "high" | "medium" | "low";
export type ItemOwner = "parent" | "baby";

export const ITEM_OWNER_LABELS: Record<ItemOwner, string> = {
  parent: "부모",
  baby: "아기",
};

export const ITEM_CATEGORY_PRESETS = ["수유용품", "옷", "상비약", "전자기기", "서류", "기타"];

export interface Trip {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Item {
  _id: string;
  tripId: string;
  name: string;
  category?: string;
  owner: ItemOwner;
  priority?: ItemPriority;
  status: ItemStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BulkResult {
  created: Item[];
  createdCount: number;
  duplicates: string[];
  excludedCount: number;
}

export interface ItineraryEvent {
  _id: string;
  tripId: string;
  day: number;
  dayLabel: string;
  time: string;
  title: string;
  location?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
