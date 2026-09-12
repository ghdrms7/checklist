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
  parent: "bg-blue-50 text-blue-600",
  baby: "bg-pink-50 text-pink-600",
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
      className="flex items-center gap-2 rounded border bg-white px-3 py-2 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="드래그 핸들"
        className="cursor-grab select-none text-zinc-400"
      >
        ⠿
      </button>
      <input
        type="checkbox"
        checked={item.status === "complete"}
        onChange={() => onToggleStatus(item)}
        className="h-4 w-4"
      />
      {editing ? (
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[6rem] flex-1 rounded border px-2 py-1 text-sm"
            autoFocus
          />
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value as ItemOwner)}
            className="rounded border px-1 py-1 text-sm"
          >
            <option value="parent">부모</option>
            <option value="baby">아기</option>
          </select>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="카테고리"
            className="w-24 rounded border px-2 py-1 text-sm"
          />
          <button onClick={saveEdit} className="text-sm text-blue-600">
            저장
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          data-testid="item-name-button"
          className={`flex-1 text-left text-sm ${
            item.status === "complete" ? "text-zinc-400 line-through" : "text-zinc-900"
          }`}
        >
          <span
            className={`mr-2 rounded px-1.5 py-0.5 text-xs font-medium ${OWNER_BADGE_CLASS[item.owner ?? "parent"]}`}
          >
            {ITEM_OWNER_LABELS[item.owner ?? "parent"]}
          </span>
          {item.name}
          {item.category && <span className="ml-2 text-xs text-zinc-400">#{item.category}</span>}
        </button>
      )}
      <button
        onClick={() => onDelete(item)}
        aria-label="삭제"
        className="text-sm text-zinc-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
