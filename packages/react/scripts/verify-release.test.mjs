import assert from 'node:assert/strict';
import { test } from 'node:test';
import { remoteTagCommit, retryVerification, verifyRelease } from './verify-release.mjs';

const version = '1.2.3';
const commit = 'a'.repeat(40);
const options = { version, commit, tagCommit: commit };
const base = 'https://ifhover.github.io/leaf-ui/';

function fixture() {
  const responses = new Map();
  const identity = { schemaVersion: 1, package: '@ifhover/leaf-ui', version, sourceCommit: commit };
  const npm = { name: '@ifhover/leaf-ui', version, gitHead: commit };
  for (const key of [version, 'latest'])
    responses.set(`https://registry.npmjs.org/%40ifhover%2Fleaf-ui/${key}`, npm);
  responses.set(`${base}versions.json`, {
    package: npm.name,
    latest: version,
    versions: [{ version, sourceCommit: commit }],
  });
  for (const site of [base, `${base}v/${version}/`]) {
    const pages = ['zh', 'en'].map((language) => ({
      id: 'components/button',
      language,
      markdown: `${language === 'en' ? 'en/' : ''}components/button.md`,
      html: `${language === 'en' ? 'en/' : ''}components/button.html`,
    }));
    responses.set(`${site}api/index.json`, { ...identity, pages });
    responses.set(`${site}ai/v1/index.json`, identity);
    for (const file of ['llm.txt', 'llms.txt'])
      responses.set(`${site}${file}`, `# Leaf UI ${version}\n@ifhover/leaf-ui@${version}`);
    for (const page of pages) {
      responses.set(
        `${site}${page.markdown}`,
        `Leaf UI ${version}; Package: @ifhover/leaf-ui; Source: ${commit}`,
      );
      responses.set(`${site}${page.html}`, '<!doctype html><title>Button</title>');
    }
    for (const file of ['changelog.md', 'en/changelog.md'])
      responses.set(`${site}${file}`, `## ${version} - 2026-10-27\n- Change.`);
    responses.set(
      `${site}index.html`,
      `<!doctype html>Leaf UI ${version}<script src="${new URL('static/main.js', site).pathname}"></script><link href="${new URL('static/main.css', site).pathname}" rel="stylesheet">`,
    );
    responses.set(`${site}static/main.js`, 'export {};');
    responses.set(`${site}static/main.css`, 'body {}');
  }
  const requests = [];
  const fetcher = async (url) => {
    requests.push(url);
    const value = responses.get(url);
    const type = url.endsWith('.js')
      ? 'text/javascript'
      : url.endsWith('.css')
        ? 'text/css'
        : 'text/plain';
    return new Response(
      typeof value === 'object' ? JSON.stringify(value) : (value ?? 'not found'),
      {
        status: value === undefined ? 404 : 200,
        headers: { 'content-type': type },
      },
    );
  };
  return { responses, requests, fetcher };
}

test('accepts lightweight and annotated remote tags, rejects missing tags', () => {
  assert.equal(remoteTagCommit(`${commit}\trefs/tags/v${version}\n`, version), commit);
  assert.equal(
    remoteTagCommit(
      `${'b'.repeat(40)}\trefs/tags/v${version}\n${commit}\trefs/tags/v${version}^{}\n`,
      version,
    ),
    commit,
  );
  assert.throws(() => remoteTagCommit('', version), /Missing remote release tag/);
});

test('verifies the deployed release with a bounded set of HTTP requests', async () => {
  const { fetcher, requests } = fixture();
  await verifyRelease({ ...options, fetcher });
  assert.equal(requests.length, 29);
  assert.equal(new Set(requests).size, requests.length);
});

test('npm-only verification never requests documentation', async () => {
  const { fetcher, requests } = fixture();
  await verifyRelease({ ...options, npmOnly: true, fetcher });
  assert.equal(requests.length, 2);
  await assert.rejects(
    verifyRelease({ ...options, tagCommit: 'b'.repeat(40), fetcher }),
    /remote release tag/,
  );
});

for (const [name, url, changed, error] of [
  [
    'npm commit mismatch',
    `https://registry.npmjs.org/%40ifhover%2Fleaf-ui/${version}`,
    { name: '@ifhover/leaf-ui', version, gitHead: 'b'.repeat(40) },
    /npm gitHead/,
  ],
  [
    'stale latest',
    'https://registry.npmjs.org/%40ifhover%2Fleaf-ui/latest',
    { version: '1.2.2' },
    /npm latest/,
  ],
  [
    'stale docs source',
    `${base}v/${version}/api/index.json`,
    { schemaVersion: 1, package: '@ifhover/leaf-ui', version, sourceCommit: 'b'.repeat(40) },
    /source commit mismatch/,
  ],
  ['missing snapshot resource', `${base}v/${version}/static/main.js`, undefined, /HTTP 404/],
  [
    'stale English notes',
    `${base}en/changelog.md`,
    '## 1.2.2 - 2026-10-27',
    /English|en release notes/,
  ],
]) {
  test(`rejects ${name}`, async () => {
    const { fetcher, responses } = fixture();
    responses.set(url, changed);
    await assert.rejects(verifyRelease({ ...options, fetcher }), error);
  });
}

test('does not accept cross-version asset paths or an HTML error page as an asset', async () => {
  const { fetcher, responses } = fixture();
  const site = `${base}v/${version}/`;
  responses.set(
    `${site}index.html`,
    `<!doctype html>${version}<script src="/leaf-ui/static/main.js"></script>`,
  );
  await assert.rejects(
    verifyRelease({ ...options, fetcher }),
    /escapes this documentation snapshot/,
  );
  responses.set(
    `${site}index.html`,
    `<!doctype html>${version}<script src="static/error.html"></script>`,
  );
  await assert.rejects(verifyRelease({ ...options, fetcher }), /no js asset/);
  responses.set(
    `${site}index.html`,
    `<!doctype html>${version}<script src="static/main.js"></script><link href="static/main.css" rel="stylesheet">`,
  );
  const htmlInsteadOfJs = async (url, init) =>
    url === `${site}static/main.js`
      ? new Response('<!doctype html>Not found', { headers: { 'content-type': 'text/html' } })
      : fetcher(url, init);
  await assert.rejects(
    verifyRelease({ ...options, fetcher: htmlInsteadOfJs }),
    /unexpected MIME type/,
  );
  await assert.rejects(
    verifyRelease({ ...options, version: '1.2.3-dev.1', fetcher }),
    /stable X.Y.Z/,
  );
});

test('retries propagation delays without concealing a final failure', async () => {
  let attempts = 0;
  const logs = [];
  const retry = { attempts: 3, wait: async () => {}, log: (line) => logs.push(line) };
  await retryVerification(() => {
    if (++attempts < 2) throw new Error('not deployed yet');
  }, retry);
  assert.equal(attempts, 2);
  assert.equal(logs.length, 1);
  await assert.rejects(
    retryVerification(() => {
      throw new Error('still stale');
    }, retry),
    /still stale/,
  );
  await assert.rejects(
    retryVerification(() => {}, { attempts: 0 }),
    /1-60 attempts/,
  );
});
