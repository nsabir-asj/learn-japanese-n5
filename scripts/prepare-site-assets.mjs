import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'public', 'trainer');
const directories = ['assets', 'content', 'features', 'fonts', 'guided', 'shared'];
const navigationProgressCss = await readFile(
  path.join(root, 'shared', 'navigation-progress.css'),
  'utf8',
);
const navigationProgressJs = await readFile(
  path.join(root, 'shared', 'navigation-progress.js'),
  'utf8',
);
const navigationProgressHead = `<style data-navigation-progress>\n${navigationProgressCss}</style>\n<script data-navigation-progress>\n${navigationProgressJs}</script>`;
const appUpdatesCss = await readFile(path.join(root, 'shared', 'app-updates.css'), 'utf8');
const appUpdatesJs = await readFile(path.join(root, 'shared', 'app-updates.js'), 'utf8');
const releaseManifest = JSON.parse(
  await readFile(path.join(root, 'content', 'releases.json'), 'utf8'),
);
const latestRelease = releaseManifest.releases?.at(-1);

if (!latestRelease?.id) throw new Error('content/releases.json needs at least one release.');

const pageScopes = new Map([
  ['index.html', 'home'],
  ['hiragana_sprint.html', 'hiragana'],
  ['katakana_sprint.html', 'katakana'],
  ['kana_sprint.html', 'kana'],
  ['vocabulary.html', 'vocabulary'],
  ['numbers.html', 'numbers'],
  ['kanji.html', 'kanji'],
  ['settings.html', 'settings'],
  [path.join('guided', 'player.html'), 'guided'],
]);

if (!target.startsWith(path.join(root, 'public') + path.sep)) {
  throw new Error('Refusing to prepare assets outside public/.');
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const directory of directories) {
  await cp(path.join(root, directory), path.join(target, directory), {
    recursive: true,
  });
}

for (const icon of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
  await cp(path.join(root, 'public', icon), path.join(target, icon));
}

const rootEntrypoints = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => entry.name);
const htmlEntrypoints = [...rootEntrypoints, path.join('guided', 'player.html')];

for (const entrypoint of htmlEntrypoints) {
  const html = await readFile(path.join(root, entrypoint), 'utf8');
  const updateConfig = JSON.stringify({
    currentReleaseId: latestRelease.id,
    pageScope: pageScopes.get(entrypoint),
    manifestUrl: entrypoint.startsWith(`guided${path.sep}`)
      ? '../content/releases.json'
      : './content/releases.json',
  }).replaceAll('<', '\\u003c');
  const appUpdatesHead = `<style data-app-updates>\n${appUpdatesCss}</style>\n<script data-app-release>globalThis.kanaAppRelease = Object.freeze(${updateConfig});</script>\n<script data-app-updates>\n${appUpdatesJs}</script>`;
  await writeFile(
    path.join(target, entrypoint),
    html.replace('<head>', `<head>\n${navigationProgressHead}\n${appUpdatesHead}`),
  );
}
