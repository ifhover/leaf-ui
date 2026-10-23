import assert from 'node:assert/strict';
import test from 'node:test';
import { browserOptions } from './browser-options.mjs';

test('browser runs keep their port, build and reports in one isolated scope', () => {
  const first = browserOptions({ LEAF_TEST_PORT: '4193', LEAF_TEST_RUN: 'button' });
  const second = browserOptions({ LEAF_TEST_PORT: '4194', LEAF_TEST_RUN: 'docs' });
  assert.equal(first.baseURL, 'http://127.0.0.1:4193');
  assert.notEqual(first.directory, second.directory);
  assert.equal(browserOptions({}).port, 4178);
});

test('invalid ports and unsafe report paths fail before launching a server', () => {
  for (const port of ['0', '1023', '65536', 'abc', '4178.5', ''])
    assert.throws(() => browserOptions({ LEAF_TEST_PORT: port }), /LEAF_TEST_PORT/u);
  for (const run of ['../other', 'a/b', 'a\\b', ''])
    assert.throws(() => browserOptions({ LEAF_TEST_RUN: run }), /LEAF_TEST_RUN/u);
});
