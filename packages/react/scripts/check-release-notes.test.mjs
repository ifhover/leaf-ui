import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getReleaseDate } from './check-release-notes.mjs';

test('accepts release notes with older releases', () => {
  const source = `# Changelog
## 0.2.0 - 2026-10-04
### Fixed
- Fix popup positioning.
## 0.1.0 - 2026-10-03
- Initial release.
`;
  assert.equal(getReleaseDate(source, '0.2.0'), '2026-10-04');
});

test('accepts prerelease versions and Windows line endings', () => {
  assert.equal(
    getReleaseDate('## 0.2.0-beta.1 - 2026-10-04\r\n- Add preview support.\r\n', '0.2.0-beta.1'),
    '2026-10-04',
  );
});

const invalidCases = [
  ['unreleased section', '## Unreleased\n- Future change.\n## 0.2.0 - 2026-10-04\n- A change.'],
  ['Chinese draft section', '## 未发布\n- 未来变更。\n## 0.2.0 - 2026-10-04\n- A change.'],
  [
    'bracketed draft section',
    '## [Unreleased]\n- Future change.\n## 0.2.0 - 2026-10-04\n- A change.',
  ],
  ['missing current version', '## 0.1.0 - 2026-10-03\n- Initial release.'],
  [
    'duplicate current versions',
    '## 0.2.0 - 2026-10-04\n- A change.\n## 0.2.0 - 2026-10-04\n- Another change.',
  ],
  ['invalid calendar date', '## 0.2.0 - 2026-02-30\n- A change.'],
  ['missing release date', '## 0.2.0\n- A change.'],
  ['empty release section', '## 0.2.0 - 2026-10-04\n## 0.1.0 - 2026-10-03\n- Initial release.'],
  ['notes only in unreleased', '## Unreleased\n- A change.\n## 0.2.0 - 2026-10-04'],
  ['placeholder notes', '## 0.2.0 - 2026-10-04\n- TODO'],
  [
    'stale version order',
    '## 0.3.0 - 2026-10-05\n- A change.\n## 0.2.0 - 2026-10-04\n- Older change.',
  ],
];

for (const [name, source] of invalidCases) {
  test(`rejects ${name}`, () => {
    assert.throws(() => getReleaseDate(source, '0.2.0'));
  });
}
