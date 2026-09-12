"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const responseBody = await res.json().catch(() => ({}));
        throw new Error(responseBody.error || "로그인에 실패했습니다");
      }
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/trips";
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-[22px] font-medium leading-tight text-ink">
          여행 준비물 체크리스트
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="h-14 rounded-sm border border-hairline px-4 text-base text-ink placeholder:text-muted focus:border-2 focus:border-ink focus:outline-none"
            autoFocus
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-sm bg-primary text-base font-medium text-on-primary transition-colors hover:bg-primary-active disabled:bg-primary-disabled"
          >
            {submitting ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </main>
  );
}
