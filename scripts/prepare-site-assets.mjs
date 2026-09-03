import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'public', 'trainer');
const directories = ['assets', 'content', 'features', 'fonts', 'guided', 'shared'];

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

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    await cp(path.join(root, entry.name), path.join(target, entry.name));
  }
}
