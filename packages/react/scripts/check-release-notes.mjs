import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getReleaseDate(source, version) {
  const releases = [
    ...source.matchAll(/^## (\d+\.\d+\.\d+(?:-[\w.-]+)?) - (\d{4}-\d{2}-\d{2})[ \t]*\r?$/gm),
  ];
  const matching = releases.filter((release) => release[1] === version);
  if (matching.length !== 1) {
    throw new Error(`必须有且只有一条当前版本的记录：## ${version} - YYYY-MM-DD`);
  }
  const release = matching[0];
  if (releases[0] !== release) {
    throw new Error(`当前版本 ${version} 必须是最新一条正式版本记录。`);
  }
  const date = release[2];
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    throw new Error(`版本 ${version} 的发布日期无效：${date}`);
  }
  const start = release.index + release[0].length;
  const remainder = source.slice(start);
  const nextHeading = remainder.search(/^## /m);
  const notes = nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
  if (!/^\s*- \S.+$/m.test(notes) || /\b(?:TODO|TBD|FIXME)\b|待补充|待完善/iu.test(notes)) {
    throw new Error(`版本 ${version} 必须包含具体的变更条目，不能只保留占位内容。`);
  }
  return date;
}

async function checkReleaseNotes() {
  const { version } = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  );
  const pages = ['changelog.md', 'en/changelog.md'];
  const dates = await Promise.all(
    pages.map(async (page) => {
      const file = new URL(`../../../apps/docs/docs/${page}`, import.meta.url);
      try {
        return getReleaseDate(await readFile(file, 'utf8'), version);
      } catch (error) {
        throw new Error(`${fileURLToPath(file)}：${error.message}`, { cause: error });
      }
    }),
  );
  if (dates[0] !== dates[1]) {
    throw new Error(`版本 ${version} 的中英文发布日期必须一致。`);
  }
  console.log(`更新记录检查通过：v${version}（${dates[0]}），中文与英文均已填写。`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await checkReleaseNotes();
  } catch (error) {
    console.error(`更新记录检查失败：${error.message}\n发布流程见 packages/react/RELEASING.md。`);
    process.exitCode = 1;
  }
}
