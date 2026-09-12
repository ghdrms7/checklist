"use client";

import { useMemo, useState } from "react";
import { bulkCreateItems } from "@/lib/api";
import { normalizeItemName as normalize } from "@/lib/normalize";
import type { BulkResult, Item } from "@/lib/types";

interface BulkPasteModalProps {
  tripId: string;
  existingItems: Item[];
  onClose: () => void;
  onCreated: (result: BulkResult) => void;
}

export default function BulkPasteModal({ tripId, existingItems, onClose, onCreated }: BulkPasteModalProps) {
  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingNames = useMemo(
    () => new Set(existingItems.map((item) => normalize(item.name))),
    [existingItems]
  );

  const lines = useMemo(
    () =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [text]
  );

  function openPreview() {
    if (lines.length === 0) return;
    const initialExcluded = new Set(lines.filter((line) => existingNames.has(normalize(line))).map(normalize));
    setExcluded(initialExcluded);
    setShowPreview(true);
  }

  function toggleInclude(line: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      const key = normalize(line);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const excludeNames = lines.filter((line) => excluded.has(normalize(line)));
      const result = await bulkCreateItems(tripId, text, excludeNames);
      onCreated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "대량 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold">대량 붙여넣기</h2>

        {!showPreview ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"한 줄에 하나씩 준비물을 입력하세요\n예)\n여권\n충전기\n선크림"}
              className="mb-3 h-48 w-full rounded border p-2 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="rounded px-4 py-2 text-sm">
                취소
              </button>
              <button
                onClick={openPreview}
                disabled={lines.length === 0}
                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                미리보기 ({lines.length}개)
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm text-zinc-500">
              중복 항목은 기본적으로 제외 표시됩니다. 체크박스로 포함/제외를 조정하세요.
            </p>
            <ul className="mb-3 max-h-64 overflow-y-auto rounded border">
              {lines.map((line, idx) => {
                const isDuplicate = existingNames.has(normalize(line));
                const included = !excluded.has(normalize(line));
                return (
                  <li
                    key={`${line}-${idx}`}
                    data-testid="bulk-preview-line"
                    className={`flex items-center gap-2 border-b px-3 py-1.5 text-sm last:border-b-0 ${
                      isDuplicate ? "bg-amber-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() => toggleInclude(line)}
                    />
                    <span className="flex-1">{line}</span>
                    {isDuplicate && (
                      <span className="text-xs text-amber-600">중복</span>
                    )}
                  </li>
                );
              })}
            </ul>
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPreview(false)} className="rounded px-4 py-2 text-sm">
                뒤로
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "등록 확정"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
