(() => {
  'use strict';

  if (!/^https?:$/.test(location.protocol)) return;

  const API_URL = '/api/progress';
  const META_KEY = 'kanaSprintCloudSyncV1';
  const STORE_KEYS = [
    'hiragana-sprint-v3',
    'katakana-sprint-v1',
    'kana-sprint-mix-v1',
    'kanaSprintNumbersV1',
    'kanaSprintVocabularyV1',
    'kanaSprintGuidedLessonsV1',
    'kanaSprintSpeechV1',
  ];
  const monitored = new Set(STORE_KEYS);
  const storagePrototype = Storage.prototype;
  const originalSetItem = storagePrototype.setItem;
  const originalRemoveItem = storagePrototype.removeItem;
  let flushTimer = 0;
  let syncing = false;
  let reloadScheduled = false;
  let cloudAvailable = true;

  function readMeta() {
    try {
      const value = JSON.parse(originalSetItem === storagePrototype.setItem
        ? localStorage.getItem(META_KEY)
        : storagePrototype.getItem.call(localStorage, META_KEY));
      return {
        revision: Number(value?.revision) || 0,
        pending: value?.pending && typeof value.pending === 'object' ? value.pending : {},
      };
    } catch {
      return { revision: 0, pending: {} };
    }
  }

  let meta = readMeta();

  function writeMeta() {
    originalSetItem.call(localStorage, META_KEY, JSON.stringify(meta));
  }

  function setStatus(message) {
    const apply = () => {
      const pill = document.querySelector('.pill');
      if (!pill) return;
      pill.textContent = message;
      pill.setAttribute('aria-live', 'polite');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    } else apply();
  }

  function markPending(key) {
    meta.pending[key] = (Number(meta.pending[key]) || 0) + 1;
    writeMeta();
    setStatus(navigator.onLine ? 'Saved locally · syncing…' : 'Saved locally · offline');
    scheduleFlush();
  }

  storagePrototype.setItem = function patchedSetItem(key, value) {
    const previous = storagePrototype.getItem.call(this, key);
    originalSetItem.call(this, key, value);
    if (this === localStorage && monitored.has(key) && previous !== String(value)) {
      markPending(key);
    }
  };

  storagePrototype.removeItem = function patchedRemoveItem(key) {
    const existed = storagePrototype.getItem.call(this, key) !== null;
    originalRemoveItem.call(this, key);
    if (this === localStorage && monitored.has(key) && existed) markPending(key);
  };

  function localStores() {
    return Object.fromEntries(
      STORE_KEYS.flatMap((key) => {
        const raw = storagePrototype.getItem.call(localStorage, key);
        if (raw === null) return [];
        try {
          return [[key, JSON.parse(raw)]];
        } catch {
          return [];
        }
      }),
    );
  }

  function applyCloudStores(stores) {
    let changed = false;
    for (const key of STORE_KEYS) {
      const cloudHasKey = Object.prototype.hasOwnProperty.call(stores, key);
      const localRaw = storagePrototype.getItem.call(localStorage, key);
      if (!cloudHasKey) {
        if (localRaw !== null) {
          originalRemoveItem.call(localStorage, key);
          changed = true;
        }
        continue;
      }
      const cloudRaw = JSON.stringify(stores[key]);
      if (localRaw !== cloudRaw) {
        originalSetItem.call(localStorage, key, cloudRaw);
        changed = true;
      }
    }
    return changed;
  }

  function scheduleReload() {
    if (reloadScheduled) return;
    reloadScheduled = true;
    setTimeout(() => location.reload(), 0);
  }

  function scheduleFlush() {
    if (!cloudAvailable) return;
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, 350);
  }

  function mutationId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID().replaceAll('-', '_');
    return `mutation_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  async function flush() {
    if (syncing || !navigator.onLine) return;
    const pendingEntries = Object.entries(meta.pending);
    if (!pendingEntries.length) return;

    syncing = true;
    const stores = localStores();
    const pendingSnapshot = Object.fromEntries(pendingEntries);
    const changes = pendingEntries.map(([key]) =>
      Object.prototype.hasOwnProperty.call(stores, key)
        ? { key, value: stores[key] }
        : { key, deleted: true },
    );

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          baseRevision: meta.revision,
          mutationId: mutationId(),
          changes,
        }),
      });
      if (response.status === 401) {
        cloudAvailable = false;
        setStatus('Auto-saved on this device');
        return;
      }
      if (!response.ok) throw new Error(`Sync failed with status ${response.status}`);

      const cloud = await response.json();
      meta.revision = Number(cloud.revision) || meta.revision;
      for (const [key, sequence] of Object.entries(pendingSnapshot)) {
        if (meta.pending[key] === sequence) delete meta.pending[key];
      }
      writeMeta();

      if (cloud.conflicted && applyCloudStores(cloud.stores || {})) {
        scheduleReload();
      } else {
        setStatus('Cloud synced');
      }
    } catch (error) {
      console.warn('Progress will remain local until cloud sync is available.', error);
      setStatus('Saved locally · sync pending');
    } finally {
      syncing = false;
      if (cloudAvailable && Object.keys(meta.pending).length) scheduleFlush();
    }
  }

  async function pull() {
    if (syncing || !navigator.onLine) return;
    try {
      const response = await fetch(API_URL, { headers: { accept: 'application/json' } });
      if (response.status === 401) {
        cloudAvailable = false;
        setStatus('Auto-saved on this device');
        return;
      }
      if (!response.ok) throw new Error(`Sync failed with status ${response.status}`);

      const cloud = await response.json();
      const cloudRevision = Number(cloud.revision) || 0;
      const hasPending = Object.keys(meta.pending).length > 0;
      const stores = localStores();

      if (cloudRevision === 0 && Object.keys(stores).length && !hasPending) {
        for (const key of Object.keys(stores)) meta.pending[key] = 1;
        writeMeta();
        await flush();
        return;
      }

      if (cloudRevision > meta.revision) {
        if (hasPending) {
          await flush();
        } else {
          const changed = applyCloudStores(cloud.stores || {});
          meta.revision = cloudRevision;
          writeMeta();
          if (changed) scheduleReload();
          else setStatus('Cloud synced');
        }
      } else {
        meta.revision = Math.max(meta.revision, cloudRevision);
        writeMeta();
        if (hasPending) await flush();
        else setStatus('Cloud synced');
      }
    } catch (error) {
      console.warn('Cloud progress is unavailable; continuing locally.', error);
      setStatus('Auto-saved on this device');
    }
  }

  window.addEventListener('online', pull);
  window.addEventListener('focus', pull);
  window.addEventListener('pagehide', () => {
    if (!Object.keys(meta.pending).length || !navigator.sendBeacon) return;
    const stores = localStores();
    const changes = Object.keys(meta.pending).map((key) =>
      Object.prototype.hasOwnProperty.call(stores, key)
        ? { key, value: stores[key] }
        : { key, deleted: true },
    );
    navigator.sendBeacon(
      API_URL,
      new Blob([
        JSON.stringify({ baseRevision: meta.revision, mutationId: mutationId(), changes }),
      ], { type: 'application/json' }),
    );
  });

  globalThis.kanaProgressSync = Object.freeze({ pull, flush });
  setStatus('Cloud sync connecting…');
  void pull();
})();
