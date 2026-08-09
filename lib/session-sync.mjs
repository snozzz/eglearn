import { reviewSchema } from "./review-contract.mjs";

export const personalOwnerScope = "personal-v1";

export function serializeReview(review) {
  return JSON.stringify(reviewSchema.parse(review));
}

export async function hashReview(review, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.subtle) {
    throw new Error("当前运行环境无法生成复盘指纹。");
  }

  const bytes = new TextEncoder().encode(serializeReview(review));
  const digest = new Uint8Array(await cryptoImpl.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function parseStoredSession(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("练习记录必须是对象。");
  }

  const id = typeof input.id === "string" ? input.id.trim() : "";
  const importedAt = typeof input.importedAt === "string" ? input.importedAt : "";
  if (!id || id.length > 128) throw new TypeError("练习记录 ID 无效。");
  if (!importedAt || Number.isNaN(Date.parse(importedAt))) {
    throw new TypeError("练习记录时间无效。");
  }

  return {
    id,
    importedAt: new Date(importedAt).toISOString(),
    review: reviewSchema.parse(input.review),
  };
}

export function mergeSessions(...groups) {
  const byReview = new Map();

  for (const group of groups) {
    for (const candidate of group ?? []) {
      const session = parseStoredSession(candidate);
      const key = serializeReview(session.review);
      const current = byReview.get(key);
      if (!current || session.importedAt > current.importedAt) {
        byReview.set(key, session);
      }
    }
  }

  return [...byReview.values()].sort((left, right) =>
    right.importedAt.localeCompare(left.importedAt),
  );
}
