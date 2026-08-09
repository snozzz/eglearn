import { z } from "zod";
import { reviewSchema } from "./review-contract.mjs";

export const maxActionRequestBytes = 64 * 1024;

const actionSaveRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  review: reviewSchema,
}).strict();

export function parseActionSaveRequest(rawBody) {
  if (new TextEncoder().encode(rawBody).byteLength > maxActionRequestBytes) {
    return {
      success: false,
      status: 413,
      error: {
        status: "rejected",
        code: "REQUEST_TOO_LARGE",
        messageZh: "请求内容过大。",
        retryable: false,
      },
    };
  }

  let input;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return {
      success: false,
      status: 400,
      error: {
        status: "rejected",
        code: "INVALID_JSON",
        messageZh: "请求不是有效 JSON。",
        retryable: false,
      },
    };
  }

  const parsed = actionSaveRequestSchema.safeParse(input);
  if (parsed.success) return { success: true, data: parsed.data };

  return {
    success: false,
    status: 422,
    error: {
      status: "rejected",
      code: "INVALID_REVIEW",
      messageZh: "保存请求不符合 EGLearn v1.0 契约。",
      retryable: false,
      fieldErrors: parsed.error.issues.slice(0, 6).map((issue) => ({
        path: issue.path.join(".") || "request",
        message: issue.message,
      })),
    },
  };
}
