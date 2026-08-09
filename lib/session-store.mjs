import { reviewSchema } from "./review-contract.mjs";
import { parseStoredSession } from "./session-sync.mjs";

const databaseName = "eglearn";
const storeName = "sessions";
const databaseVersion = 1;
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const databasePromises = new WeakMap();

function encodeTime(value) {
  let remaining = BigInt(value);
  let output = "";
  for (let index = 0; index < 10; index += 1) {
    output = alphabet[Number(remaining % 32n)] + output;
    remaining /= 32n;
  }
  return output;
}

function encodeRandom(bytes) {
  let bits = 0;
  let bitCount = 0;
  let output = "";
  for (const byte of bytes) {
    bits = (bits << 8) | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      output += alphabet[(bits >> bitCount) & 31];
      bits &= (1 << bitCount) - 1;
    }
  }
  return output.slice(0, 16).padEnd(16, "0");
}

export function createSessionId(now = Date.now(), randomBytes) {
  const bytes = randomBytes ?? globalThis.crypto.getRandomValues(new Uint8Array(10));
  if (!Number.isSafeInteger(now) || now < 0 || bytes.length !== 10) {
    throw new TypeError("A session ID requires a non-negative timestamp and 10 random bytes.");
  }
  return `${encodeTime(now)}${encodeRandom(bytes)}`;
}

function openDatabase(indexedDb) {
  if (!indexedDb) return Promise.reject(new Error("当前浏览器不支持本地练习记录。"));
  if (databasePromises.has(indexedDb)) return databasePromises.get(indexedDb);

  const promise = new Promise((resolve, reject) => {
    const request = indexedDb.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        const store = database.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("importedAt", "importedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开本地练习记录。"));
  });

  databasePromises.set(indexedDb, promise);
  return promise;
}

function complete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("本地记录写入失败。"));
    transaction.onabort = () => reject(transaction.error ?? new Error("本地记录写入已取消。"));
  });
}

export async function saveSession(review, options = {}) {
  const validatedReview = reviewSchema.parse(review);
  const now = options.now ?? Date.now();
  const record = {
    id: createSessionId(now, options.randomBytes),
    importedAt: new Date(now).toISOString(),
    review: validatedReview,
  };

  const database = await openDatabase(options.indexedDB ?? globalThis.indexedDB);
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).add(record);
  await complete(transaction);
  return record;
}

export async function putSessionRecord(record, options = {}) {
  const validatedRecord = parseStoredSession(record);
  const database = await openDatabase(options.indexedDB ?? globalThis.indexedDB);
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).put(validatedRecord);
  await complete(transaction);
  return validatedRecord;
}

export async function replaceSessions(records, options = {}) {
  const validatedRecords = records.map(parseStoredSession);
  const database = await openDatabase(options.indexedDB ?? globalThis.indexedDB);
  const transaction = database.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.clear();
  for (const record of validatedRecords) store.put(record);
  await complete(transaction);
  return validatedRecords;
}

export async function listSessions(options = {}) {
  const database = await openDatabase(options.indexedDB ?? globalThis.indexedDB);
  const transaction = database.transaction(storeName, "readonly");
  const request = transaction.objectStore(storeName).getAll();
  const records = await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法读取本地练习记录。"));
  });
  await complete(transaction);
  return records.sort((left, right) => right.importedAt.localeCompare(left.importedAt));
}

export async function clearSessions(options = {}) {
  const database = await openDatabase(options.indexedDB ?? globalThis.indexedDB);
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).clear();
  await complete(transaction);
}
