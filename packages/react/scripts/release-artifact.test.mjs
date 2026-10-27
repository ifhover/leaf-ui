import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { packRelease, verifyArtifact } from './release-artifact.mjs';

test('packs checked output once, binds its commit and rejects stale or changed artifacts', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-release-'));
  const packageRoot = path.join(root, 'packages/react');
  const directory = path.join(root, '.quality');
  const manifest = {
    name: '@ifhover/leaf-ui',
    version: '1.2.3',
    files: ['dist', 'README.md'],
    scripts: { prepublishOnly: 'node -e "throw Error(\'must not rebuild\')"' },
  };
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  try {
    await mkdir(path.join(packageRoot, 'dist'), { recursive: true });
    await writeFile(path.join(root, '.gitignore'), '.quality/\n');
    await writeFile(path.join(packageRoot, 'package.json'), JSON.stringify(manifest));
    await writeFile(path.join(packageRoot, 'README.md'), '# Fixture\n');
    await writeFile(path.join(packageRoot, 'dist/index.js'), 'export const value = 42;\n');
    git('init', '--quiet');
    git('add', '.');
    git(
      '-c',
      'user.name=Release test',
      '-c',
      'user.email=test@example.invalid',
      'commit',
      '-qm',
      'fixture',
    );
    const commit = git('rev-parse', 'HEAD');
    const artifact = await packRelease({ root, directory });
    assert.equal(artifact.commit, commit);
    assert.equal(git('status', '--porcelain'), '');
    assert.equal(
      execFileSync('tar', ['-xOf', artifact.tarball, 'package/dist/index.js'], {
        encoding: 'utf8',
      }),
      'export const value = 42;\n',
    );
    await assert.rejects(
      verifyArtifact({ directory, manifest, commit: 'f'.repeat(40) }),
      /exact release commit/,
    );
    await assert.rejects(
      verifyArtifact({ directory, manifest: { ...manifest, version: '1.2.4' }, commit }),
      /exact release commit/,
    );
    const original = await readFile(artifact.tarball);
    await appendFile(artifact.tarball, 'changed');
    await assert.rejects(verifyArtifact({ directory, manifest, commit }), /tarball changed/);
    await writeFile(artifact.tarball, original);
    await assert.rejects(
      verifyArtifact({ directory, manifest: { ...manifest, main: 'unexpected.js' }, commit }),
      /metadata changed/,
    );
    await writeFile(path.join(packageRoot, 'README.md'), 'dirty source');
    await assert.rejects(packRelease({ root, directory }), /Commit release sources/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
