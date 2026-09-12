"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { createItem, deleteItem, fetcher, updateItem } from "@/lib/api";
import type { Item, ItemOwner, ItemStatus } from "@/lib/types";
import { ITEM_CATEGORY_PRESETS } from "@/lib/types";
import DroppableColumn from "./DroppableColumn";
import ItemCard from "./ItemCard";

interface TripBoardProps {
  tripId: string;
}

type OwnerFilter = "all" | ItemOwner;
type ColumnId = "incomplete" | "complete";

export default function TripBoard({ tripId }: TripBoardProps) {
  const { data: items, mutate } = useSWR<Item[]>(`/api/trips/${tripId}/items`, fetcher);

  const [newItemName, setNewItemName] = useState("");
  const [newItemOwner, setNewItemOwner] = useState<ItemOwner>("parent");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeColumn, setActiveColumn] = useState<ColumnId>("incomplete");
  const [error, setError] = useState<string | null>(null);

  const displayItems = items ?? [];
  const total = displayItems.length;
  const completeCount = displayItems.filter((item) => item.status === "complete").length;
  const completionRate = total === 0 ? 0 : Math.round((completeCount / total) * 100);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (items ?? []).forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = displayItems.filter((item) => {
    if (ownerFilter !== "all" && (item.owner ?? "parent") !== ownerFilter) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    return true;
  });
  const incomplete = filteredItems.filter((item) => item.status === "incomplete");
  const complete = filteredItems.filter((item) => item.status === "complete");

  async function changeStatus(item: Item, status: ItemStatus) {
    if (item.status === status || !items) return;
    setError(null);
    try {
      await mutate(
        async () => {
          await updateItem(item._id, { status });
          return items.map((it) => (it._id === item._id ? { ...it, status } : it));
        },
        {
          optimisticData: items.map((it) => (it._id === item._id ? { ...it, status } : it)),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경에 실패했습니다");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const item = displayItems.find((it) => it._id === active.id);
    if (!item) return;
    const targetStatus = over.id as ItemStatus;
    if (targetStatus !== "incomplete" && targetStatus !== "complete") return;
    changeStatus(item, targetStatus);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setError(null);
    try {
      await createItem(tripId, {
        name: newItemName.trim(),
        owner: newItemOwner,
        category: newItemCategory.trim() || undefined,
      });
      setNewItemName("");
      setNewItemCategory("");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "준비물 등록에 실패했습니다");
    }
  }

  async function handleRename(item: Item, name: string, category: string, owner: ItemOwner) {
    setError(null);
    try {
      await updateItem(item._id, { name, category: category || undefined, owner });
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다");
    }
  }

  async function handleDelete(item: Item) {
    setError(null);
    try {
      await deleteItem(item._id);
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-muted">
          <span>완료율</span>
          <span className="font-medium text-ink">{completionRate}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-strong">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-sm bg-error/10 px-3 py-2 text-sm font-medium text-error">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-hairline bg-surface-soft p-4">
        <form onSubmit={handleAddItem} className="flex flex-1 flex-wrap gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="준비물 이름"
            className="min-w-[8rem] flex-1 rounded-sm border border-hairline bg-canvas px-3 py-2 text-sm focus:border-2 focus:border-ink focus:outline-none"
          />
          <select
            value={newItemOwner}
            onChange={(e) => setNewItemOwner(e.target.value as ItemOwner)}
            className="rounded-sm border border-hairline bg-canvas px-2 py-2 text-sm"
          >
            <option value="parent">부모</option>
            <option value="baby">아기</option>
          </select>
          <input
            type="text"
            list="category-presets"
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            placeholder="분류 (선택)"
            className="w-28 rounded-sm border border-hairline bg-canvas px-2 py-2 text-sm focus:border-2 focus:border-ink focus:outline-none"
          />
          <datalist id="category-presets">
            {ITEM_CATEGORY_PRESETS.map((preset) => (
              <option key={preset} value={preset} />
            ))}
          </datalist>
          <button
            type="submit"
            className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary-active"
          >
            추가
          </button>
        </form>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value as OwnerFilter)}
          className="rounded-sm border border-hairline bg-canvas px-3 py-2 text-sm"
          aria-label="구분 필터"
        >
          <option value="all">전체 구분</option>
          <option value="parent">부모</option>
          <option value="baby">아기</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-sm border border-hairline bg-canvas px-3 py-2 text-sm"
          aria-label="분류 필터"
        >
          <option value="all">전체 분류</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex gap-1 border-b border-hairline sm:hidden">
        <button
          onClick={() => setActiveColumn("incomplete")}
          data-testid="tab-column-incomplete"
          className={`relative pb-2 text-sm font-semibold ${
            activeColumn === "incomplete"
              ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-ink"
              : "text-muted"
          }`}
        >
          미완료 ({incomplete.length})
        </button>
        <button
          onClick={() => setActiveColumn("complete")}
          data-testid="tab-column-complete"
          className={`relative ml-4 pb-2 text-sm font-semibold ${
            activeColumn === "complete"
              ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-ink"
              : "text-muted"
          }`}
        >
          완료 ({complete.length})
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className={activeColumn === "incomplete" ? "contents" : "hidden sm:contents"}>
            <DroppableColumn id="incomplete" title={`미완료 (${incomplete.length})`}>
              {incomplete.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onToggleStatus={(it) => changeStatus(it, "complete")}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </DroppableColumn>
          </div>
          <div className={activeColumn === "complete" ? "contents" : "hidden sm:contents"}>
            <DroppableColumn id="complete" title={`완료 (${complete.length})`}>
              {complete.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onToggleStatus={(it) => changeStatus(it, "incomplete")}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </DroppableColumn>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
