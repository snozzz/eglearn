import { parseStoredSession } from "./session-sync.mjs";

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string"
        ? payload.error
        : "EGLearn 云同步暂时不可用。",
    );
  }
  return payload;
}

export async function fetchCloudSessions(fetchImpl = globalThis.fetch) {
  const response = await fetchImpl("/api/sessions", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = await readJson(response);
  if (!Array.isArray(payload.sessions)) {
    throw new Error("云端返回了无法识别的练习记录。");
  }
  return payload.sessions.map(parseStoredSession);
}

export async function saveCloudReview(review, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl("/api/sessions", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ review }),
  });
  const payload = await readJson(response);
  if (payload.status !== "saved" && payload.status !== "already_saved") {
    throw new Error("云端没有确认复盘已保存。");
  }
  return { status: payload.status, session: parseStoredSession(payload.session) };
}

export async function deleteCloudSessions(fetchImpl = globalThis.fetch) {
  const response = await fetchImpl("/api/sessions", {
    method: "DELETE",
    credentials: "same-origin",
  });
  const payload = await readJson(response);
  if (payload.status !== "deleted") {
    throw new Error("云端没有确认记录已删除。");
  }
}
