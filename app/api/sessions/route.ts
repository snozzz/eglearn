import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  deleteCloudSessions,
  listCloudSessions,
  saveCloudSession,
} from "@/db/sessions";
import { reviewInputSchema } from "@/lib/review-contract.mjs";

async function requireBrowserUser() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json(
      { error: "请先通过 ChatGPT 登录 EGLearn。" },
      { status: 401 },
    );
  }
  return null;
}

const privateJsonHeaders = { "cache-control": "private, no-store" };

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "云端练习记录暂时不可用。";
  const status = message.includes("no such table") ? 503 : 500;
  return Response.json(
    { error: status === 503 ? "云端记录正在初始化，请稍后重试。" : "云端练习记录暂时不可用。" },
    { status },
  );
}

export async function GET() {
  const unauthorized = await requireBrowserUser();
  if (unauthorized) return unauthorized;

  try {
    return Response.json(
      { sessions: await listCloudSessions() },
      { headers: privateJsonHeaders },
    );
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireBrowserUser();
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as { review?: unknown };
    const parsed = reviewInputSchema.safeParse(payload.review);
    if (!parsed.success) {
      return Response.json(
        { error: "复盘不符合 EGLearn v1.0/v1.1 契约。" },
        { status: 400 },
      );
    }

    return Response.json(
      await saveCloudSession(parsed.data),
      { headers: privateJsonHeaders },
    );
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE() {
  const unauthorized = await requireBrowserUser();
  if (unauthorized) return unauthorized;

  try {
    await deleteCloudSessions();
    return Response.json(
      { status: "deleted" },
      { headers: privateJsonHeaders },
    );
  } catch (error) {
    return routeError(error);
  }
}
