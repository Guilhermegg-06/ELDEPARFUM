import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const ROOTS = ['app', 'components', 'lib'];
const CLIENT_FILE_PATTERN = /\.tsx?$/;
const SERVER_IMPORT_PATTERN = /from ['\"](?:@\/)?lib\/supabaseServer['\"]|from ['\"]\.\/supabaseServer['\"]/;

function listFiles(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (CLIENT_FILE_PATTERN.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function isClientComponent(source: string): boolean {
  const trimmed = source.trimStart();
  return trimmed.startsWith("'use client'") || trimmed.startsWith('"use client"');
}

describe('client security boundaries', () => {
  it('does not allow client files to import supabaseServer or mention the service role key', () => {
    const rootDir = process.cwd();
    const violations: string[] = [];

    for (const root of ROOTS) {
      const targetDir = path.join(rootDir, root);
      if (!fs.existsSync(targetDir)) continue;

      for (const filePath of listFiles(targetDir)) {
        const source = fs.readFileSync(filePath, 'utf-8');
        if (!isClientComponent(source)) continue;

        if (SERVER_IMPORT_PATTERN.test(source) || source.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          violations.push(path.relative(rootDir, filePath));
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
