// Builds a deployment staging folder only. Never creates Azure resources.
import { cp, mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
const source = resolve(import.meta.dirname, '..');
await readFile(join(source, 'package-lock.json')); // fail closed without a reviewed lock
await readFile(join(source, 'node_modules/@azure/functions/package.json'));
await readFile(join(source, 'node_modules/@azure/data-tables/package.json'));
const target = join(source, 'deploy-' + randomUUID());
await mkdir(target);
for (const name of ['src', 'host.json', 'package.json', 'package-lock.json', 'node_modules']) {
  await cp(join(source, name), join(target, name), { recursive: true });
}
console.log(target);
