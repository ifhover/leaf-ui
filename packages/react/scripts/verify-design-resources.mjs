import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { TinyColor } from '@ctrl/tinycolor';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '../../..'),
  assets = path.join(root, 'apps/docs/docs/public/design');
const tokens = JSON.parse(await readFile(path.join(assets, 'leaf.tokens.json'), 'utf8'));
const studio = JSON.parse(await readFile(path.join(assets, 'leaf.tokens-studio.json'), 'utf8'));
for (const [name, value] of Object.entries({
  radiusSm: 4,
  radius: 8,
  radiusMd: 12,
  radiusLg: 16,
})) {
  assert.equal(tokens.foundation[name].$value.value, value);
  assert.equal(studio.foundation[name].value, `${value}px`);
}
for (const [name, value] of Object.entries({
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightStrong: 700,
})) {
  assert.equal(tokens.foundation[name].$value, value);
  assert.equal(studio.foundation[name].value, value);
}
const { outputFiles } = await build({
  stdin: {
    contents: "export * from './colors'; export * from './color-shades';",
    resolveDir: path.join(root, 'packages/react/src'),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { deriveColors, semanticColorFamilies, semanticColorShadeSteps } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);
const expectedFamilies = ['primary', 'success', 'danger', 'warning', 'info'];
const expectedShadeSteps = [
  'light-3',
  'light-7',
  'light-9',
  'dark-1',
  'dark-3',
  'dark-7',
  'dark-9',
];
const neutralColorScaleSteps = [100, 200, 300, 400, 500, 600, 700, 800, 900];
assert.deepEqual([...semanticColorFamilies], expectedFamilies);
assert.deepEqual([...semanticColorShadeSteps], expectedShadeSteps);
assert.equal(tokens.comfortable.dimension['control-height'].$value.value, 34);
assert.equal(tokens.compact.dimension['control-height'].$value.value, 30);
assert.equal(tokens.comfortable.dimension['density-option-height'].$value.value, 30);
assert.equal(tokens.compact.dimension['density-option-height'].$value.value, 26);
assert.equal(tokens.foundation.fontSize.$value.value, 14);
assert.equal(tokens.foundation.lineHeight.$type, 'dimension');
assert.deepEqual(tokens.foundation.lineHeight.$value, { value: 20, unit: 'px' });
for (const mode of ['light', 'dark']) {
  const runtime = deriveColors(mode);
  assert.equal(Object.keys(tokens[mode].color).length, Object.keys(runtime).length);
  for (const [variable, value] of Object.entries(runtime)) {
    const name = variable.slice('--leaf-color-'.length);
    const parsed = new TinyColor(value);
    assert.equal(tokens[mode].color[name].$value.hex, parsed.toHexString(), `${mode} ${name}`);
    assert.equal(tokens[mode].color[name].$value.alpha, parsed.getAlpha(), `${mode} ${name} alpha`);
    assert.equal(studio[mode].color[name].value, value, `${mode} ${name} studio`);
  }
  for (const family of expectedFamilies)
    for (const shade of expectedShadeSteps)
      assert.ok(runtime[`--leaf-color-${family}-${shade}`], `${mode} ${family}-${shade}`);
  for (const family of expectedFamilies)
    for (const step of neutralColorScaleSteps)
      assert.equal(
        runtime[`--leaf-color-${family}-${step}`],
        undefined,
        `${mode} ${family}-${step} must not remain`,
      );
  for (const step of neutralColorScaleSteps)
    assert.ok(runtime[`--leaf-color-neutral-${step}`], `${mode} neutral-${step}`);
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
    if (sheet === 'foundations')
      assert.ok(content.includes('Body 14 / 20'), `${mode} foundations include the 20px line grid`);
    if (sheet === 'components') {
      assert.equal(dom.window.document.querySelector('#button-soft-default'), null);
      const outlineDefault = dom.window.document.querySelector('#button-outline-default');
      const outlineHover = dom.window.document.querySelector('#button-outline-hover');
      const outlinePressed = dom.window.document.querySelector('#button-outline-pressed');
      assert.ok(outlineDefault?.querySelector('rect')?.getAttribute('filter'));
      assert.equal(
        outlineHover?.querySelector('rect')?.getAttribute('fill'),
        outlineDefault.querySelector('rect').getAttribute('fill'),
      );
      assert.equal(
        outlineHover?.querySelector('text')?.getAttribute('fill'),
        outlineDefault.querySelector('text').getAttribute('fill'),
      );
      assert.notEqual(
        outlinePressed?.querySelector('rect')?.getAttribute('stroke'),
        outlineDefault.querySelector('rect').getAttribute('stroke'),
      );
      assert.notEqual(
        outlineHover?.querySelector('rect')?.getAttribute('stroke'),
        outlineDefault.querySelector('rect').getAttribute('stroke'),
      );
      assert.equal(
        outlinePressed?.querySelector('rect')?.getAttribute('stroke'),
        outlineHover?.querySelector('rect')?.getAttribute('stroke'),
      );
      assert.equal(
        outlinePressed?.querySelector('rect')?.getAttribute('filter'),
        outlineDefault.querySelector('rect').getAttribute('filter'),
      );
      assert.notEqual(
        outlinePressed?.querySelector('rect')?.getAttribute('fill'),
        outlineDefault.querySelector('rect').getAttribute('fill'),
      );
      assert.equal(
        outlinePressed?.querySelector('text')?.getAttribute('fill'),
        outlineDefault.querySelector('text').getAttribute('fill'),
      );
    }
    dom.window.close();
  }
}
const plugin = await readFile(path.join(root, 'design/figma/code.js'), 'utf8');
assert.ok(plugin.includes("['solid', 'outline', 'text', 'link']"));
assert.ok(!plugin.includes("['solid', 'soft', 'outline', 'ghost']"));
const zip = await readFile(path.join(assets, 'leaf-figma-plugin.zip'));
assert.equal(zip.readUInt32LE(0), 0x04034b50);
const end = zip.length - 22;
assert.equal(zip.readUInt32LE(end), 0x06054b50);
assert.equal(zip.readUInt16LE(end + 10), 3);
console.log('DTCG tokens, density values, editable SVG structure and plugin archive verified.');
