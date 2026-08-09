import { and, desc, eq } from "drizzle-orm";
import { getDb } from ".";
import { speakingSessions } from "./schema";
import {
  hashReview,
  parseStoredSession,
  personalOwnerScope,
  serializeReview,
} from "../lib/session-sync.mjs";

const sessionLimit = 200;

type Review = ReturnType<typeof parseStoredSession>["review"];

function rowToSession(row: typeof speakingSessions.$inferSelect) {
  return parseStoredSession({
    id: row.id,
    importedAt: row.importedAt,
    review: JSON.parse(row.reviewJson),
  });
}

export async function listCloudSessions(ownerScope = personalOwnerScope) {
  const rows = await getDb()
    .select()
    .from(speakingSessions)
    .where(eq(speakingSessions.ownerScope, ownerScope))
    .orderBy(desc(speakingSessions.importedAt), desc(speakingSessions.id))
    .limit(sessionLimit);

  return rows.map(rowToSession);
}

export async function saveCloudSession(
  review: Review,
  options: { idempotencyKey?: string; ownerScope?: string } = {},
) {
  const ownerScope = options.ownerScope ?? personalOwnerScope;
  const reviewJson = serializeReview(review);
  const contentHash = await hashReview(review);
  const idempotencyKey = options.idempotencyKey ?? `manual:${contentHash}`;
  const database = getDb();
  const findExisting = () => database
      .select()
      .from(speakingSessions)
      .where(
        and(
          eq(speakingSessions.ownerScope, ownerScope),
          eq(speakingSessions.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);
  const findIdenticalReview = () => database
      .select()
      .from(speakingSessions)
      .where(
        and(
          eq(speakingSessions.ownerScope, ownerScope),
          eq(speakingSessions.contentHash, contentHash),
        ),
      )
      .limit(1);
  const existing = await findExisting();

  if (existing[0]) {
    if (existing[0].contentHash !== contentHash) {
      throw new IdempotencyConflictError();
    }
    return { status: "already_saved" as const, session: rowToSession(existing[0]) };
  }
  const identicalReview = await findIdenticalReview();
  if (identicalReview[0]) {
    return { status: "already_saved" as const, session: rowToSession(identicalReview[0]) };
  }

  const importedAt = new Date().toISOString();
  const id = crypto.randomUUID();
  try {
    await database.insert(speakingSessions).values({
      id,
      ownerScope,
      importedAt,
      schemaVersion: review.schemaVersion,
      idempotencyKey,
      contentHash,
      reviewJson,
    });
  } catch (error) {
    const raced = await findExisting();
    if (raced[0]) {
      if (raced[0].contentHash !== contentHash) throw new IdempotencyConflictError();
      return { status: "already_saved" as const, session: rowToSession(raced[0]) };
    }
    const racedReview = await findIdenticalReview();
    if (racedReview[0]) {
      return { status: "already_saved" as const, session: rowToSession(racedReview[0]) };
    }
    throw error;
  }

  return {
    status: "saved" as const,
    session: parseStoredSession({ id, importedAt, review }),
  };
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super("The idempotency key was already used for different review content.");
    this.name = "IdempotencyConflictError";
  }
}

export async function deleteCloudSessions(ownerScope = personalOwnerScope) {
  await getDb()
    .delete(speakingSessions)
    .where(eq(speakingSessions.ownerScope, ownerScope));
}
