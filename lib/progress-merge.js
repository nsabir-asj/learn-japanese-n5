const MONOTONIC_FIELDS = new Set([
  'assisted',
  'bestStreak',
  'correct',
  'exposure',
  'introduced',
  'mistakes',
  'seen',
  'total',
  'tries',
  'unlockedStage',
  'wrong',
]);

const TIMESTAMP_FIELDS = new Set([
  'dueAt',
  'lastSeen',
  'savedAt',
  'updatedAt',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function entityTimestamp(value) {
  if (!isPlainObject(value)) return 0;
  return Number(value.lastSeen) || 0;
}

/**
 * Merge two independently edited progress snapshots after an optimistic-lock
 * conflict. Item records carrying `lastSeen` are last-answer-wins; unrelated
 * nested records are retained from both devices; monotonic counters never go
 * backwards. Other conflicting scalar values use the incoming value because
 * its mutation reached the server last.
 */
export function mergeProgressValue(remote, incoming, fieldName = '') {
  if (Object.is(remote, incoming)) return remote;
  if (remote === undefined) return incoming;
  if (incoming === undefined) return remote;

  if (typeof remote === 'number' && typeof incoming === 'number') {
    if (MONOTONIC_FIELDS.has(fieldName) || TIMESTAMP_FIELDS.has(fieldName)) {
      return Math.max(remote, incoming);
    }
    return incoming;
  }

  if (Array.isArray(remote) && Array.isArray(incoming)) return incoming;

  if (isPlainObject(remote) && isPlainObject(incoming)) {
    const remoteTimestamp = entityTimestamp(remote);
    const incomingTimestamp = entityTimestamp(incoming);
    if (remoteTimestamp || incomingTimestamp) {
      return incomingTimestamp >= remoteTimestamp ? incoming : remote;
    }

    const merged = {};
    for (const key of new Set([...Object.keys(remote), ...Object.keys(incoming)])) {
      merged[key] = mergeProgressValue(remote[key], incoming[key], key);
    }
    return merged;
  }

  return incoming;
}
