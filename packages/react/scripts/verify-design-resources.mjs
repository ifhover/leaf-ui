import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '../../..'),
  assets = path.join(root, 'apps/docs/docs/public/design');
const tokens = JSON.parse(await readFile(path.join(assets, 'leaf.tokens.json'), 'utf8'));
assert.equal(tokens.light.color.primary.$value.hex, '#20834a');
assert.equal(tokens.dark.color.primary.$value.hex, '#83cf9e');
assert.equal(tokens.comfortable.dimension['control-height'].$value.value, 34);
assert.equal(tokens.compact.dimension['control-height'].$value.value, 28);
for (const mode of ['light', 'dark']) {
  for (const value of Object.values(tokens[mode].color)) {
    assert.equal(value.$type, 'color');
    assert.equal(value.$value.colorSpace, 'srgb');
    assert.ok(value.$value.components.every((channel) => channel >= 0 && channel <= 1));
    assert.ok(value.$value.alpha >= 0 && value.$value.alpha <= 1);
  }
  for (const sheet of ['foundations', 'components']) {
    const content = await readFile(path.join(assets, `leaf-${mode}-${sheet}.svg`), 'utf8');
    assert.ok(!content.includes('undefined'));
    const dom = new JSDOM(content, { contentType: 'image/svg+xml' });
    assert.ok(dom.window.document.querySelector('title')?.textContent);
    assert.ok(dom.window.document.querySelectorAll('text').length > 10);
    assert.ok(dom.window.document.querySelectorAll('g[id]').length > 10);
    dom.window.close();
  }
}
const zip = await readFile(path.join(assets, 'leaf-figma-plugin.zip'));
assert.equal(zip.readUInt32LE(0), 0x04034b50);
const end = zip.length - 22;
assert.equal(zip.readUInt32LE(end), 0x06054b50);
assert.equal(zip.readUInt16LE(end + 10), 3);
console.log('DTCG tokens, density values, editable SVG structure and plugin archive verified.');
