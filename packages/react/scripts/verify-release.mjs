import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const packageName = '@ifhover/leaf-ui';
const docsUrl = 'https://ifhover.github.io/leaf-ui/';

export function remoteTagCommit(output, version) {
  const tag = `refs/tags/v${version}`;
  const refs = new Map(
    output
      .trim()
      .split(/\r?\n/)
      .map((line) => line.split(/\s+/).reverse()),
  );
  const commit = refs.get(`${tag}^{}`) ?? refs.get(tag);
  assert.match(commit ?? '', /^[a-f0-9]{40}$/, `Missing remote release tag v${version}.`);
  return commit;
}

async function resource(url, fetcher) {
  const response = await fetcher(String(url), {
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  assert.ok(response.ok, `${url}: HTTP ${response.status}.`);
  return response;
}

function identity(value, { version, commit }, label) {
  assert.equal(value.schemaVersion, 1, `${label}: unsupported schema.`);
  assert.equal(value.package, packageName, `${label}: package mismatch.`);
  assert.equal(value.version, version, `${label}: version mismatch.`);
  assert.equal(value.sourceCommit, commit, `${label}: source commit mismatch.`);
}

function siteResource(relative, site) {
  const url = new URL(relative, site);
  assert.ok(
    url.origin === site.origin && url.pathname.startsWith(site.pathname),
    `Resource escapes this documentation snapshot: ${url}`,
  );
  return url;
}

export async function verifyDocumentation({ version, commit, fetcher = fetch, base = docsUrl }) {
  const root = new URL(base);
  assert.ok(root.pathname.endsWith('/'), 'The documentation base must end in /.');
  const versions = await (await resource(new URL('versions.json', root), fetcher)).json();
  assert.equal(versions.package, packageName, 'Documentation package mismatch.');
  assert.equal(versions.latest, version, 'Default documentation is not npm latest.');
  assert.equal(
    versions.versions.find((entry) => entry.version === version)?.sourceCommit,
    commit,
    'The version menu must contain this exact published source.',
  );
  for (const site of [root, new URL(`v/${version}/`, root)]) {
    const json = async (file) => (await resource(siteResource(file, site), fetcher)).json();
    const text = async (file) => (await resource(siteResource(file, site), fetcher)).text();
    const api = await json('api/index.json');
    identity(api, { version, commit }, String(site));
    identity(await json('ai/v1/index.json'), { version, commit }, `${site}ai/v1`);
    for (const file of ['llm.txt', 'llms.txt']) {
      const content = await text(file);
      assert.ok(content.startsWith(`# Leaf UI ${version}\n`), `${site}${file}: wrong version.`);
      assert.ok(content.includes(`${packageName}@${version}`), `${site}${file}: wrong package.`);
    }
    // Two representative pages, not a component/theme/viewport traversal.
    for (const language of ['zh', 'en']) {
      const page = api.pages.find(
        (entry) => entry.id === 'components/button' && entry.language === language,
      );
      assert.ok(page, `${site}: missing ${language} Button documentation.`);
      const markdown = await text(page.markdown);
      for (const marker of [`Leaf UI ${version}`, `Package: ${packageName}`, `Source: ${commit}`])
        assert.ok(markdown.includes(marker), `${site}${page.markdown}: missing ${marker}.`);
      assert.match(await text(page.html), /<!doctype html/i, `${site}${page.html}: not HTML.`);
      const changelog = await text(language === 'en' ? 'en/changelog.md' : 'changelog.md');
      assert.ok(
        changelog.includes(`## ${version} - `),
        `${site}: missing ${language} release notes.`,
      );
    }
    const html = await text('index.html');
    assert.match(html, /<!doctype html/i, `${site}: not HTML.`);
    assert.ok(html.includes(version), `${site}: missing the displayed version.`);
    const assets = [
      ...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g),
    ].map((match) => siteResource(match[1], site));
    for (const [extension, mime] of [
      ['js', /javascript|ecmascript/i],
      ['css', /text\/css/i],
    ]) {
      const asset = assets.find((url) => url.pathname.endsWith(`.${extension}`));
      assert.ok(asset, `${site}: no ${extension} asset.`);
      const response = await resource(asset, fetcher);
      assert.match(
        response.headers.get('content-type') ?? '',
        mime,
        `${asset}: unexpected MIME type.`,
      );
      assert.ok((await response.text()).length > 0, `${asset}: empty asset.`);
    }
  }
}

export async function verifyRelease({
  version,
  commit,
  tagCommit,
  npmOnly = false,
  fetcher = fetch,
  base = docsUrl,
}) {
  assert.match(
    version,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    'Use a stable X.Y.Z version.',
  );
  assert.match(commit, /^[a-f0-9]{40}$/, 'Use a full release commit SHA.');
  assert.equal(tagCommit, commit, 'The remote release tag does not match the expected commit.');
  const registry = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  const published = await (await resource(`${registry}/${version}`, fetcher)).json();
  assert.equal(published.name, packageName, 'npm package mismatch.');
  assert.equal(published.version, version, 'npm version mismatch.');
  assert.equal(published.gitHead, commit, 'npm gitHead does not match the release commit.');
  const latest = await (await resource(`${registry}/latest`, fetcher)).json();
  assert.equal(latest.version, version, 'npm latest does not match the release version.');
  assert.equal(latest.gitHead, commit, 'npm latest points at a different release commit.');
  if (!npmOnly) await verifyDocumentation({ version, commit, fetcher, base });
}

export async function retryVerification(
  check,
  { attempts = 1, wait = () => setTimeout(10_000), log = console.log } = {},
) {
  assert.ok(Number.isInteger(attempts) && attempts > 0 && attempts <= 60, 'Use 1-60 attempts.');
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await check();
    } catch (error) {
      if (attempt === attempts) throw error;
      log(`Waiting for published metadata / deployment (${attempt}/${attempts}): ${error.message}`);
      await wait();
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      version: { type: 'string' },
      commit: { type: 'string' },
      'npm-only': { type: 'boolean', default: false },
      attempts: { type: 'string', default: '1' },
    },
  });
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const version = values.version ?? manifest.version;
  assert.match(
    version,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    'Use a stable X.Y.Z version.',
  );
  const refs = execFileSync(
    'git',
    ['ls-remote', '--tags', 'origin', `refs/tags/v${version}`, `refs/tags/v${version}^{}`],
    {
      cwd: fileURLToPath(new URL('../../../', import.meta.url)),
      encoding: 'utf8',
      timeout: 30_000,
    },
  );
  const tagCommit = remoteTagCommit(refs, version);
  const commit = values.commit ?? tagCommit;
  await retryVerification(
    () => verifyRelease({ version, commit, tagCommit, npmOnly: values['npm-only'] }),
    { attempts: Number(values.attempts) },
  );
  const result = `Verified ${packageName}@${version}; remote tag v${version}; commit ${commit}.${values['npm-only'] ? ' Documentation is not checked yet.' : ` Default and /v/${version}/ documentation metadata, bilingual samples and representative assets are reachable (not visual acceptance).`}`;
  console.log(result);
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${result}\n`);
}
