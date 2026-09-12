"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import useSWR from "swr";
import { createItem, deleteItem, fetcher, updateItem } from "@/lib/api";
import type { BulkResult, Item, ItemOwner, ItemStatus } from "@/lib/types";
import { ITEM_CATEGORY_PRESETS } from "@/lib/types";
import BulkPasteModal from "./BulkPasteModal";
import DroppableColumn from "./DroppableColumn";
import ItemCard from "./ItemCard";

interface TripBoardProps {
  tripId: string;
}

export default function TripBoard({ tripId }: TripBoardProps) {
  const { data: items, mutate } = useSWR<Item[]>(`/api/trips/${tripId}/items`, fetcher);

  const [newItemName, setNewItemName] = useState("");
  const [newItemOwner, setNewItemOwner] = useState<ItemOwner>("parent");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayItems = items ?? [];
  const incomplete = displayItems.filter((item) => item.status === "incomplete");
  const complete = displayItems.filter((item) => item.status === "complete");
  const total = displayItems.length;
  const completionRate = total === 0 ? 0 : Math.round((complete.length / total) * 100);

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
    if (!confirm(`"${item.name}"을 삭제할까요?`)) return;
    setError(null);
    try {
      await deleteItem(item._id);
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  }

  function handleBulkCreated(result: BulkResult) {
    setShowBulkModal(false);
    setBanner(`${result.createdCount}개 등록됨 (제외 ${result.excludedCount}개)`);
    mutate();
    setTimeout(() => setBanner(null), 4000);
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

      {banner && (
        <div className="mb-4 rounded-sm bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          {banner}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-sm bg-error/10 px-3 py-2 text-sm font-medium text-error">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-hairline bg-surface-soft p-4">
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
        <button
          onClick={() => setShowBulkModal(true)}
          className="rounded-sm border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-surface-strong"
        >
          대량 붙여넣기
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 sm:flex-row">
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
      </DndContext>

      {showBulkModal && (
        <BulkPasteModal
          tripId={tripId}
          existingItems={displayItems}
          onClose={() => setShowBulkModal(false)}
          onCreated={handleBulkCreated}
        />
      )}
    </div>
  );
}
