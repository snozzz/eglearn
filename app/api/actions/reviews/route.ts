import { IdempotencyConflictError, saveCloudSession } from "@/db/sessions";
import { parseActionSaveRequest } from "@/lib/action-request.mjs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const parsed = parseActionSaveRequest(rawBody);
    if (!parsed.success) return Response.json(parsed.error, { status: parsed.status });

    const result = await saveCloudSession(parsed.data.review, {
      idempotencyKey: parsed.data.idempotencyKey,
    });
    return Response.json(
      {
        status: result.status,
        sessionId: result.session.id,
        savedAt: result.session.importedAt,
        topicEn: result.session.review.topicEn,
        dashboardUrl: new URL("/#dashboard", request.url).toString(),
      },
      {
        status: result.status === "saved" ? 201 : 200,
        headers: { "cache-control": "private, no-store" },
      },
    );
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return Response.json(
        {
          status: "rejected",
          code: "IDEMPOTENCY_CONFLICT",
          messageZh: "同一个保存请求标识已用于不同内容。",
          retryable: false,
        },
        { status: 409 },
      );
    }

    return Response.json(
      {
        status: "error",
        code: "TEMPORARY_FAILURE",
        messageZh: "复盘暂时无法保存。",
        retryable: true,
      },
      { status: 503 },
    );
  }
}
