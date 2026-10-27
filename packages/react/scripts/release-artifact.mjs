import assert from 'node:assert/strict';
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const artifactDirectory = path.join(repository, 'packages/react/.quality/release');
const filename = 'leaf-ui.tgz';
const integrity = (data) => `sha512-${createHash('sha512').update(data).digest('base64')}`;
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

export async function verifyArtifact({ directory, manifest, commit }) {
  const metadata = JSON.parse(await readFile(path.join(directory, 'release.json'), 'utf8'));
  assert.deepEqual(
    { name: metadata.name, version: metadata.version, commit: metadata.commit },
    { name: manifest.name, version: manifest.version, commit },
    'The artifact must belong to this exact release commit and version.',
  );
  const tarball = path.join(directory, filename);
  assert.equal(integrity(await readFile(tarball)), metadata.integrity, 'Release tarball changed.');
  const packed = JSON.parse(
    execFileSync('tar', ['-xOf', tarball, 'package/package.json'], { encoding: 'utf8' }),
  );
  assert.deepEqual(packed, { ...manifest, gitHead: commit }, 'Packed package metadata changed.');
  return { ...metadata, tarball };
}

export async function packRelease({ root = repository, directory = artifactDirectory } = {}) {
  assert.equal(git(root, 'status', '--porcelain'), '', 'Commit release sources before packing.');
  const commit = git(root, 'rev-parse', 'HEAD');
  const packageRoot = path.join(root, 'packages/react');
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@ifhover/leaf-ui');
  // Packing never rebuilds: only the quality job's already-checked output is copied.
  for (const hook of ['prepare', 'prepack', 'postpack'])
    assert.ok(
      !manifest.scripts?.[hook],
      `${hook} would modify the checked package during packing.`,
    );
  await mkdir(directory, { recursive: true });
  const staging = await mkdtemp(path.join(directory, 'pack-'));
  try {
    for (const file of manifest.files) {
      assert.ok(!path.isAbsolute(file) && !file.split(/[\\/]/).includes('..'));
      await cp(path.join(packageRoot, file), path.join(staging, file), { recursive: true });
    }
    // npm publish <tarball> preserves this gitHead and does not run prepublishOnly.
    await writeFile(
      path.join(staging, 'package.json'),
      `${JSON.stringify({ ...manifest, gitHead: commit }, null, 2)}\n`,
    );
    const [packed] = JSON.parse(execSync('npm pack --json', { cwd: staging, encoding: 'utf8' }));
    const data = await readFile(path.join(staging, packed.filename));
    await writeFile(path.join(directory, filename), data);
    await writeFile(
      path.join(directory, 'release.json'),
      `${JSON.stringify({ name: manifest.name, version: manifest.version, commit, integrity: integrity(data) }, null, 2)}\n`,
    );
    return await verifyArtifact({ directory, manifest, commit });
  } finally {
    // Only the unique staging directory created above is removed.
    await rm(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  assert.ok(['pack', 'verify'].includes(command), 'Use release-artifact.mjs pack|verify.');
  const result =
    command === 'pack'
      ? await packRelease()
      : await verifyArtifact({
          directory: artifactDirectory,
          manifest: JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')),
          commit: git(repository, 'rev-parse', 'HEAD'),
        });
  console.log(`Verified release artifact: ${result.name}@${result.version} (${result.commit})`);
}
