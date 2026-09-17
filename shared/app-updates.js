(() => {
  'use strict';

  const config = globalThis.kanaAppRelease;
  if (!config?.currentReleaseId || !config?.pageScope || !config?.manifestUrl) return;

  const LAST_LOADED_KEY = 'kanaSprintLastLoadedReleaseV1';
  const PENDING_FROM_KEY = 'kanaSprintPendingUpdateFromV1';
  const DISMISSED_KEY = 'kanaSprintDismissedReleaseV1';
  const RELEASE_EVENT = 'kana-sprint-release-observed';
  const currentReleaseId = config.currentReleaseId;
  let checkedRemoteReleaseId = '';
  let banner = null;

  function storageGet(storage, key) {
    try {
      return storage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  function storageSet(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch {
      // Update discovery still works when browser storage is unavailable.
    }
  }

  function storageRemove(storage, key) {
    try {
      storage.removeItem(key);
    } catch {
      // Nothing to clear when browser storage is unavailable.
    }
  }

  function releaseIndex(releases, releaseId) {
    return releases.findIndex((release) => release?.id === releaseId);
  }

  function releasesAfter(manifest, releaseId, throughReleaseId = '') {
    const releases = Array.isArray(manifest?.releases) ? manifest.releases : [];
    const start = releaseIndex(releases, releaseId);
    const end = throughReleaseId ? releaseIndex(releases, throughReleaseId) : releases.length - 1;
    if (end < 0) return [];
    if (start < 0) return releases.slice(0, end + 1);
    return releases.slice(start + 1, end + 1);
  }

  function isReleaseAfter(manifest, candidateId, referenceId) {
    const releases = Array.isArray(manifest?.releases) ? manifest.releases : [];
    const candidate = releaseIndex(releases, candidateId);
    const reference = releaseIndex(releases, referenceId);
    return candidate >= 0 && (reference < 0 || candidate > reference);
  }

  function requireRelease(manifest, releaseId) {
    if (releaseIndex(manifest.releases, releaseId) < 0) {
      throw new Error(`Release notes do not include ${releaseId} yet.`);
    }
  }

  function affectsPage(release) {
    return Array.isArray(release?.changes) && release.changes.some((change) =>
      Array.isArray(change?.pages) &&
      (change.pages.includes('all') || change.pages.includes(config.pageScope)),
    );
  }

  async function loadManifest(releaseId) {
    const url = new URL(config.manifestUrl, document.baseURI);
    url.searchParams.set('release', releaseId);
    const response = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Release notes failed with status ${response.status}`);
    const manifest = await response.json();
    if (!Array.isArray(manifest?.releases)) throw new Error('Release notes are invalid.');
    return manifest;
  }

  function pageLabel(pages) {
    if (!Array.isArray(pages) || pages.includes('all')) return 'Across the app';
    const labels = {
      home: 'Home',
      hiragana: 'Hiragana',
      katakana: 'Katakana',
      kana: 'Kana Mix',
      vocabulary: 'Vocabulary',
      numbers: 'Numbers',
      kanji: 'Kanji',
      guided: 'Guided lessons',
      settings: 'Settings',
    };
    return pages.map((page) => labels[page] || page).join(' · ');
  }

  function showChangelog(releases) {
    if (!releases.length || typeof HTMLDialogElement === 'undefined') return;

    const dialog = document.createElement('dialog');
    dialog.className = 'app-changelog';
    dialog.setAttribute('aria-labelledby', 'appChangelogTitle');

    const inner = document.createElement('div');
    inner.className = 'app-changelog-inner';
    inner.innerHTML = `
      <p class="app-changelog-eyebrow">Latest changes</p>
      <h2 id="appChangelogTitle">What’s new</h2>
      <p class="app-changelog-intro">Updates since your last visit.</p>
    `;

    for (const release of releases) {
      const section = document.createElement('section');
      section.className = 'app-changelog-release';

      const heading = document.createElement('h3');
      heading.textContent = release.title || 'Update';
      section.append(heading);

      if (release.publishedAt) {
        const date = document.createElement('time');
        date.className = 'app-changelog-date';
        date.dateTime = release.publishedAt;
        date.textContent = new Intl.DateTimeFormat(undefined, {
          year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
        }).format(new Date(`${release.publishedAt}T00:00:00Z`));
        section.append(date);
      }

      const list = document.createElement('ul');
      for (const change of Array.isArray(release.changes) ? release.changes : []) {
        if (!change?.text) continue;
        const item = document.createElement('li');
        const scope = document.createElement('span');
        scope.className = 'app-changelog-scope';
        scope.textContent = pageLabel(change.pages);
        item.append(scope, document.createTextNode(change.text));
        list.append(item);
      }
      if (list.childElementCount) section.append(list);
      inner.append(section);
    }

    const footer = document.createElement('div');
    footer.className = 'app-changelog-footer';
    const close = document.createElement('button');
    close.className = 'app-changelog-close';
    close.type = 'button';
    close.textContent = 'Continue practicing';
    close.addEventListener('click', () => dialog.close());
    footer.append(close);
    inner.append(footer);
    dialog.append(inner);
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
  }

  function showBanner(latestReleaseId) {
    if (banner || storageGet(sessionStorage, DISMISSED_KEY) === latestReleaseId) return;

    banner = document.createElement('aside');
    banner.className = 'app-update-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class="app-update-banner-copy">
        <strong>A new version is ready</strong>
        <span>Your progress is saved. Update and reload when you’re ready.</span>
      </div>
      <div class="app-update-banner-actions"></div>
    `;

    const actions = banner.querySelector('.app-update-banner-actions');
    const update = document.createElement('button');
    update.className = 'app-update-button';
    update.type = 'button';
    update.textContent = 'Update & reload';
    update.addEventListener('click', () => {
      storageSet(sessionStorage, PENDING_FROM_KEY, currentReleaseId);
      globalThis.kanaNavigationProgress?.start();
      const url = new URL(location.href);
      url.searchParams.set('_release', latestReleaseId);
      location.replace(url);
    });

    const later = document.createElement('button');
    later.className = 'app-update-later';
    later.type = 'button';
    later.textContent = 'Later';
    later.addEventListener('click', () => {
      storageSet(sessionStorage, DISMISSED_KEY, latestReleaseId);
      banner?.remove();
      banner = null;
    });

    actions.append(update, later);
    document.body.append(banner);
  }

  async function observeRelease(latestReleaseId) {
    if (
      typeof latestReleaseId !== 'string' ||
      !latestReleaseId ||
      latestReleaseId === currentReleaseId ||
      latestReleaseId === checkedRemoteReleaseId
    ) return;

    checkedRemoteReleaseId = latestReleaseId;
    try {
      const manifest = await loadManifest(latestReleaseId);
      requireRelease(manifest, latestReleaseId);
      const updates = releasesAfter(manifest, currentReleaseId, latestReleaseId);
      if (updates.some(affectsPage)) showBanner(latestReleaseId);
    } catch (error) {
      checkedRemoteReleaseId = '';
      console.warn('Could not check the latest app release.', error);
    }
  }

  async function handleLoadedRelease() {
    const pendingFrom = storageGet(sessionStorage, PENDING_FROM_KEY);
    const lastLoaded = storageGet(localStorage, LAST_LOADED_KEY);
    const fromReleaseId = pendingFrom || lastLoaded;
    const requestedReleaseId = new URL(location.href).searchParams.get('_release') || '';

    if (!lastLoaded) {
      storageSet(localStorage, LAST_LOADED_KEY, currentReleaseId);
    }

    if (requestedReleaseId === currentReleaseId) {
      const cleanUrl = new URL(location.href);
      cleanUrl.searchParams.delete('_release');
      history.replaceState(history.state, '', cleanUrl);
    }

    if (!fromReleaseId || fromReleaseId === currentReleaseId) return;

    try {
      const manifest = await loadManifest(currentReleaseId);
      requireRelease(manifest, currentReleaseId);
      if (lastLoaded && isReleaseAfter(manifest, currentReleaseId, lastLoaded)) {
        storageSet(localStorage, LAST_LOADED_KEY, currentReleaseId);
      }
      if (!isReleaseAfter(manifest, currentReleaseId, fromReleaseId)) return;
      const updates = releasesAfter(manifest, fromReleaseId, currentReleaseId);
      if (updates.length) {
        storageRemove(sessionStorage, PENDING_FROM_KEY);
        showChangelog(updates);
      }
    } catch (error) {
      console.warn('Could not load the release notes.', error);
    }
  }

  globalThis.addEventListener(RELEASE_EVENT, (event) => {
    void observeRelease(event.detail?.releaseId);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void handleLoadedRelease(), { once: true });
  } else {
    void handleLoadedRelease();
  }
})();
