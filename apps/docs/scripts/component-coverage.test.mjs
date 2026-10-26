import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { publicApi } from './export-ai-docs.mjs';
import { collectComponentDocuments, componentPageExceptions } from './export-component-docs.mjs';

const repository = path.resolve(import.meta.dirname, '../../..');

test('every canonical component page participates in the bilingual structured contract', async () => {
  const documents = await collectComponentDocuments(repository);
  const exports = new Set((await publicApi(repository)).map(({ name }) => name));
  const expected = [];
  for (const language of ['', 'en/']) {
    const directory = path.join(repository, 'apps/docs/docs', language, 'components');
    for (const file of await readdir(directory)) {
      if (file.endsWith('.mdx') && !componentPageExceptions.has(file))
        expected.push(`${language}components/${file}`);
    }
  }
  assert.deepEqual(documents.map(({ file }) => file).sort(), expected.sort());
  for (const { document, file } of documents) {
    assert.equal(document.apiNames[0], document.primaryApi, file);
    assert.ok(exports.has(document.primaryApi), `${file}: primary API is a real public export`);
    assert.ok(document.description, `${file}: original short description`);
    assert.ok(document.basic.includes('```'), `${file}: complete basic source`);
    assert.doesNotMatch(document.basic, /<ComponentExample\b|leaf:section/);
    assert.ok(document.api.startsWith('## API'), file);
    assert.equal(new Set(document.examples.map(({ id }) => id)).size, document.examples.length);
    for (const [index, example] of document.examples.entries()) {
      assert.equal(example.index, index + 1, file);
      assert.ok(example.markdown.includes('```'), `${file}/${example.id}: full source`);
      assert.doesNotMatch(example.markdown, /<ComponentExample\b|leaf:(?:section|example)/);
    }
  }
});

test('a new component cannot silently bypass export by omitting leafDoc', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'leaf-coverage-'));
  try {
    for (const prefix of ['', 'en/']) {
      const target = path.join(directory, 'apps/docs/docs', prefix, 'components');
      await mkdir(target, { recursive: true });
      await writeFile(
        path.join(target, 'missing.mdx'),
        '# Missing\n\nA component without metadata.\n',
      );
    }
    await assert.rejects(collectComponentDocuments(directory), /require static leafDoc metadata/);
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    await rm(directory, { recursive: true, force: true });
  }
});

test('reference-only exceptions retain their canonical role in both languages', async () => {
  for (const prefix of ['', 'en/']) {
    const directory = path.join(repository, 'apps/docs/docs', prefix, 'components');
    for (const [file, reason] of componentPageExceptions) {
      assert.ok(reason);
      const source = await readFile(path.join(directory, file), 'utf8');
      assert.doesNotMatch(source, /export const leafDoc\b/);
      if (file === 'empty.mdx') assert.match(source, /\/components\/result#empty-api/);
    }
  }
});
