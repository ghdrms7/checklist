"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { ITEM_OWNER_LABELS, type Item, type ItemOwner } from "@/lib/types";

interface ItemCardProps {
  item: Item;
  onToggleStatus: (item: Item) => void;
  onRename: (item: Item, name: string, category: string, owner: ItemOwner) => void;
  onDelete: (item: Item) => void;
}

const OWNER_BADGE_CLASS: Record<ItemOwner, string> = {
  parent: "bg-surface-strong text-ink",
  baby: "bg-primary/10 text-primary",
};

export default function ItemCard({ item, onToggleStatus, onRename, onDelete }: ItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item._id,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category ?? "");
  const [owner, setOwner] = useState<ItemOwner>(item.owner ?? "parent");

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  function saveEdit() {
    if (!name.trim()) return;
    onRename(item, name.trim(), category.trim(), owner);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="item-card"
      className="flex items-center gap-2 rounded-md border border-hairline bg-canvas px-3 py-2.5 transition-shadow hover:shadow-airbnb"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="드래그 핸들"
        className="cursor-grab select-none text-muted-soft"
      >
        ⠿
      </button>
      <input
        type="checkbox"
        checked={item.status === "complete"}
        onChange={() => onToggleStatus(item)}
        className="h-4 w-4 accent-primary"
      />
      {editing ? (
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[6rem] flex-1 rounded-sm border border-hairline px-2 py-1 text-sm focus:border-2 focus:border-ink focus:outline-none"
            autoFocus
          />
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value as ItemOwner)}
            className="rounded-sm border border-hairline px-1 py-1 text-sm"
          >
            <option value="parent">부모</option>
            <option value="baby">아기</option>
          </select>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="카테고리"
            className="w-24 rounded-sm border border-hairline px-2 py-1 text-sm focus:border-2 focus:border-ink focus:outline-none"
          />
          <button onClick={saveEdit} className="text-sm font-medium text-primary hover:underline">
            저장
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          data-testid="item-name-button"
          className={`flex-1 text-left text-base ${
            item.status === "complete" ? "text-muted-soft line-through" : "text-ink"
          }`}
        >
          <span
            className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${OWNER_BADGE_CLASS[item.owner ?? "parent"]}`}
          >
            {ITEM_OWNER_LABELS[item.owner ?? "parent"]}
          </span>
          {item.name}
          {item.category && <span className="ml-2 text-sm text-muted">#{item.category}</span>}
        </button>
      )}
      <button
        onClick={() => onDelete(item)}
        aria-label="삭제"
        className="text-sm text-muted-soft hover:text-error"
      >
        ✕
      </button>
    </div>
  );
}
