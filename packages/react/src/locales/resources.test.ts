// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const checker = path.resolve('scripts/check-translations.mjs');
function run(file: string, ...args: string[]) {
  return spawnSync(process.execPath, [checker, file, ...args], { encoding: 'utf8' });
}
describe('published JSON resources and validation', () => {
  it.each(['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'])(
    'validates the complete %s resource and all ICU arguments',
    (locale) => {
      const result = run(`src/locales/${locale}.json`);
      expect(result.stdout + result.stderr).toContain('Translation valid.');
      expect(result.status).toBe(0);
    },
  );
  it('keeps the generated schema and traditional resource current', () => {
    const result = spawnSync(process.execPath, ['scripts/generate-locale.mjs', '--check'], {
      encoding: 'utf8',
    });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
  it('reports missing entries while supporting intentional partial files', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'leaf-translations-'));
    try {
      const file = path.join(directory, 'ja-JP.json');
      await writeFile(
        file,
        JSON.stringify({ $schema: 'schema.json', select: { placeholder: '選択' } }),
      );
      expect(run(file).status).toBe(1);
      const partial = run(file, '--allow-partial');
      expect(partial.status).toBe(0);
      expect(partial.stdout).toContain('Missing translations');
      expect(partial.stdout).toContain('select.empty');
      await writeFile(file, JSON.stringify({ pagination: { total: '' } }));
      expect(run(file, '--allow-partial').status).toBe(0);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  it('rejects unknown keys, invalid arrays, malformed ICU and renamed placeholders', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'leaf-translations-'));
    try {
      const file = path.join(directory, 'bad.json');
      const cases = [
        [{ select: { typo: 'Wrong' } }, 'select.typo: unknown key'],
        [{ constructor: { typo: 'Wrong' } }, 'constructor: unknown key'],
        [{ calendar: { weekdays: ['Monday'] } }, 'calendar.weekdays: expected 7 strings'],
        [{ pagination: { total: '{count} items' } }, 'pagination.total: template arguments differ'],
        [{ pagination: { total: '{total, plural, invalid' } }, 'pagination.total:'],
        [{ select: { placeholder: 42 } }, 'select.placeholder: expected a string'],
      ] as const;
      for (const [data, message] of cases) {
        await writeFile(file, JSON.stringify(data));
        const result = run(file, '--allow-partial');
        expect(result.status).toBe(1);
        expect(result.stderr).toContain(message);
      }
      const schema = JSON.parse(await readFile('src/locales/schema.json', 'utf8'));
      expect(schema.additionalProperties).toBe(false);
      expect(schema.properties.select.properties.placeholder.type).toBe('string');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
