import { env } from 'cloudflare:workers';
import { mergeProgressValue } from '@/lib/progress-merge.js';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2_000_000;
const MAX_RECENT_MUTATIONS = 100;
const ALLOWED_STORE_KEYS = new Set([
  'hiragana-sprint-v3',
  'katakana-sprint-v1',
  'kana-sprint-mix-v1',
  'kanaSprintNumbersV1',
  'kanaSprintVocabularyV1',
  'kanaSprintGuidedLessonsV1',
  'kanaSprintSpeechV1',
]);

type StoreEntry = { value: unknown; updatedAt: number };
type Stores = Record<string, StoreEntry>;
type ProgressRow = {
  revision: number;
  stores_json: string;
  recent_mutation_ids_json: string;
  updated_at: number;
};
type Change = { key: string; value?: unknown; deleted?: boolean };

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function publicSnapshot(row: ProgressRow) {
  const entries = parseJson<Stores>(row.stores_json, {});
  return {
    revision: row.revision,
    updatedAt: row.updated_at,
    stores: Object.fromEntries(
      Object.entries(entries).map(([key, entry]) => [key, entry.value]),
    ),
  };
}

async function loadRow(userId: string): Promise<ProgressRow> {
  const row = await env.DB.prepare(
    `SELECT revision, stores_json, recent_mutation_ids_json, updated_at
     FROM user_progress WHERE user_id = ?`,
  )
    .bind(userId)
    .first<ProgressRow>();

  if (!row) throw new Error('Progress row was not initialized.');
  return row;
}

export async function GET(request: Request) {
  void request;
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 });

  const now = Date.now();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO user_progress
      (user_id, revision, stores_json, recent_mutation_ids_json, updated_at)
     VALUES (?, 0, '{}', '[]', ?)`,
  )
    .bind(user.userId, now)
    .run();

  return Response.json(publicSnapshot(await loadRow(user.userId)));
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 });

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ error: 'Progress payload is too large.' }, { status: 413 });
  }

  let body: { baseRevision?: unknown; mutationId?: unknown; changes?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const baseRevision = Number(body.baseRevision);
  const mutationId = typeof body.mutationId === 'string' ? body.mutationId : '';
  const changes = Array.isArray(body.changes) ? (body.changes as Change[]) : [];
  if (
    !Number.isSafeInteger(baseRevision) ||
    baseRevision < 0 ||
    !/^[a-zA-Z0-9_-]{8,100}$/.test(mutationId) ||
    changes.length === 0 ||
    changes.length > ALLOWED_STORE_KEYS.size ||
    changes.some(
      (change) =>
        !change ||
        typeof change !== 'object' ||
        !ALLOWED_STORE_KEYS.has(change.key) ||
        (!change.deleted && !Object.prototype.hasOwnProperty.call(change, 'value')),
    )
  ) {
    return Response.json({ error: 'Invalid progress mutation.' }, { status: 400 });
  }

  const now = Date.now();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO user_progress
      (user_id, revision, stores_json, recent_mutation_ids_json, updated_at)
     VALUES (?, 0, '{}', '[]', ?)`,
  )
    .bind(user.userId, now)
    .run();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const row = await loadRow(user.userId);
    const recentMutationIds = parseJson<string[]>(row.recent_mutation_ids_json, []);
    if (recentMutationIds.includes(mutationId)) {
      return Response.json({ ...publicSnapshot(row), conflicted: false });
    }

    const conflicted = row.revision !== baseRevision;
    const stores = parseJson<Stores>(row.stores_json, {});
    for (const change of changes) {
      if (change.deleted) {
        if (!conflicted) delete stores[change.key];
        continue;
      }
      const current = stores[change.key];
      stores[change.key] = {
        value: conflicted && current
          ? mergeProgressValue(current.value, change.value)
          : change.value,
        updatedAt: now,
      };
    }

    const nextRevision = row.revision + 1;
    const nextMutationIds = [...recentMutationIds, mutationId].slice(-MAX_RECENT_MUTATIONS);
    const result = await env.DB.prepare(
      `UPDATE user_progress
       SET revision = ?, stores_json = ?, recent_mutation_ids_json = ?, updated_at = ?
       WHERE user_id = ? AND revision = ?`,
    )
      .bind(
        nextRevision,
        JSON.stringify(stores),
        JSON.stringify(nextMutationIds),
        now,
        user.userId,
        row.revision,
      )
      .run();

    if ((result.meta.changes ?? 0) === 1) {
      return Response.json({
        revision: nextRevision,
        updatedAt: now,
        stores: Object.fromEntries(
          Object.entries(stores).map(([key, entry]) => [key, entry.value]),
        ),
        conflicted,
      });
    }
  }

  return Response.json(
    { error: 'Progress changed repeatedly; please retry.' },
    { status: 409 },
  );
}
