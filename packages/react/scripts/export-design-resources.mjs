import fs from 'node:fs/promises';
import path from 'node:path';
import { crc32 } from 'node:zlib';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '../../..');
const publicPath = path.join(root, 'apps/docs/docs/public/design');
const pluginPath = path.join(root, 'design/figma');
await fs.mkdir(publicPath, { recursive: true });
await fs.mkdir(pluginPath, { recursive: true });
const bundle = await build({
  stdin: {
    contents: `export * from './src/colors'; export * from './src/density';`,
    resolveDir: path.join(root, 'packages/react'),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { defaultColors, deriveColors, densityTokens } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`
);
const { TinyColor } = await import('@ctrl/tinycolor');
const palettes = Object.fromEntries(
  ['light', 'dark'].map((mode) => [
    mode,
    {
      ...defaultColors[mode],
      ...Object.fromEntries(
        Object.entries(deriveColors(mode)).map(([key, value]) => [
          key.slice('--leaf-color-'.length),
          value,
        ]),
      ),
    },
  ]),
);
const colorValue = (value) => {
  const c = new TinyColor(value).toRgb();
  return {
    colorSpace: 'srgb',
    components: [c.r, c.g, c.b].map((channel) => channel / 255),
    alpha: c.a,
    hex: new TinyColor(value).toHexString(),
  };
};
const tokens = {},
  studio = {};
for (const [mode, palette] of Object.entries(palettes)) {
  tokens[mode] = {
    color: Object.fromEntries(
      Object.entries(palette).map(([key, value]) => [
        key,
        { $type: 'color', $value: colorValue(value) },
      ]),
    ),
  };
  studio[mode] = {
    color: Object.fromEntries(
      Object.entries(palette).map(([key, value]) => [key, { type: 'color', value }]),
    ),
  };
}
for (const [mode, density] of Object.entries(densityTokens)) {
  tokens[mode] = {
    dimension: Object.fromEntries(
      Object.entries(density).map(([key, value]) => [
        key,
        { $type: 'dimension', $value: { value, unit: 'px' } },
      ]),
    ),
  };
  studio[mode] = {
    dimension: Object.fromEntries(
      Object.entries(density).map(([key, value]) => [
        key,
        { type: 'dimension', value: `${value}px` },
      ]),
    ),
  };
}
tokens.foundation = {
  radius: { $type: 'dimension', $value: { value: 10, unit: 'px' } },
  fontSize: { $type: 'dimension', $value: { value: 14, unit: 'px' } },
  lineHeight: { $type: 'number', $value: 1.6 },
  motionDuration: { $type: 'duration', $value: { value: 200, unit: 'ms' } },
};
await fs.writeFile(
  path.join(publicPath, 'leaf.tokens.json'),
  `${JSON.stringify(tokens, null, 2).replace(/"components": \[\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\s*\]/gu, '"components": [$1, $2, $3]')}\n`,
);
await fs.writeFile(
  path.join(publicPath, 'leaf.tokens-studio.json'),
  `${JSON.stringify(studio, null, 2)}\n`,
);
const escapeXml = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const text = (x, y, value, size = 14, color = 'text', weight = 400) =>
  `<text x="${x}" y="${y}" fill="${escapeXml(color)}" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`;
const rect = (x, y, w, h, fill, radius = 10, stroke = 'none') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}"/>`;
for (const [mode, p] of Object.entries(palettes)) {
  let foundation = text(32, 50, `Leaf UI / ${mode} foundations`, 28, p.text, 600);
  const colors = Object.entries(defaultColors[mode]);
  for (const [index, [key, value]] of colors.entries()) {
    const x = 32 + (index % 4) * 200,
      y = 82 + Math.floor(index / 4) * 138;
    foundation += `<g id="color-${key}">${rect(x, y, 172, 68, value, 12, p.border)}${text(x, y + 94, key, 14, p.text, 500)}${text(x, y + 116, value, 12, p['text-muted'])}</g>`;
  }
  foundation +=
    text(32, 542, 'Typography · Inter / system sans-serif', 20, p.text, 600) +
    text(32, 580, 'Heading 24 / 600', 24, p.text, 600) +
    text(32, 614, 'Body 14 / 1.6 · Semantic colors and stable geometry', 14, p.text) +
    text(32, 650, 'Comfortable: 34px controls / 8px spacing', 14, p['text-muted']) +
    text(32, 680, 'Compact: 28px controls / 6px spacing', 14, p['text-muted']);
  let components = text(32, 50, `Leaf UI / ${mode} component states`, 28, p.text, 600);
  const states = ['Default', 'Hover', 'Pressed', 'Disabled'];
  for (const [row, variant] of ['solid', 'soft', 'outline', 'ghost'].entries()) {
    const y = 94 + row * 84;
    components += text(32, y + 24, variant, 14, p['text-muted']);
    for (const [col, state] of states.entries()) {
      const x = 160 + col * 160;
      const bg =
        variant === 'solid'
          ? state === 'Hover' || state === 'Pressed'
            ? p['primary-white-97-5']
            : p.primary
          : variant === 'soft'
            ? p[`primary-alpha-${state === 'Hover' ? 18 : state === 'Pressed' ? 25 : 11}`]
            : variant === 'outline'
              ? p[`surface-muted-border-${['Hover', 'Pressed'].includes(state) ? 75 : 65}`]
              : state === 'Hover'
                ? p['surface-muted']
                : state === 'Pressed'
                  ? p.border
                  : 'none';
      components += `<g id="button-${variant}-${state.toLowerCase()}" opacity="${state === 'Disabled' ? 0.45 : 1}">${rect(x, y, 136, 34, bg, 10)}${text(x + 24, y + 22, state, 14, variant === 'solid' ? p['on-primary'] : variant === 'soft' ? p.primary : p.text, 500)}</g>`;
    }
  }
  components += text(32, 450, 'Fields / default · focus · error', 20, p.text, 600);
  for (const [index, state] of ['Default', 'Focus', 'Error'].entries()) {
    const x = 32 + index * 264;
    components += `<g id="input-${state.toLowerCase()}">${state === 'Focus' ? rect(x - 3, 484, 246, 40, 'none', 12, p['primary-alpha-42']) : ''}${rect(x, 487, 240, 34, p.surface, 10, state === 'Error' ? p.danger : state === 'Focus' ? p.primary : p.border)}${text(x + 10, 509, state, 14, p.text)}</g>`;
  }
  components += `<g id="alert-info">${rect(32, 557, 784, 72, p['info-surface-5'], 10, p['info-border-12'])}${rect(48, 577, 28, 28, p['info-alpha-10'], 8)}${text(59, 596, 'i', 18, p.info, 600)}${text(90, 584, 'Keep the team informed', 14, p.text, 600)}${text(90, 608, 'Readable spacing and a semantic status icon.', 14, p['text-muted'])}</g>`;
  components += `<g id="result-success">${rect(32, 657, 784, 188, p.surface, 16, p.border)}${rect(392, 681, 64, 64, p['success-surface-9'], 16)}<path d="M410 713 L420 723 L439 702" fill="none" stroke="${p.success}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${text(332, 778, 'Project saved', 24, p.text, 600)}${text(278, 812, 'Your changes are ready for the team.', 14, p['text-muted'])}</g>`;
  components += `<g id="dialog-anatomy">${rect(32, 877, 784, 170, p['surface-raised'], 10, p.border)}${text(56, 917, 'Dialog heading', 17, p.text, 600)}${rect(56, 933, 736, 34, p.surface, 10, p.border)}${text(66, 955, 'Form and footer share an inline edge', 14, p['text-muted'])}${rect(680, 993, 112, 34, p.primary, 10)}${text(710, 1015, 'Save', 14, p['on-primary'], 500)}</g>`;
  const svg = (height, content) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="848" height="${height}" viewBox="0 0 848 ${height}" font-family="Inter, Arial, sans-serif"><title>Leaf UI ${mode} design resources</title>${rect(0, 0, 848, height, p.surface, 0)}${content}</svg>\n`;
  await fs.writeFile(path.join(publicPath, `leaf-${mode}-foundations.svg`), svg(724, foundation));
  await fs.writeFile(path.join(publicPath, `leaf-${mode}-components.svg`), svg(1080, components));
}
await fs.writeFile(
  path.join(pluginPath, 'tokens.js'),
  `// Generated from the runtime theme sources; no network access.\nconst leafPalettes = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(palettes).map(([mode, p]) => [
        mode,
        Object.fromEntries(
          Object.entries(p).map(([key, value]) => {
            const c = new TinyColor(value).toRgb();
            return [key, { r: c.r / 255, g: c.g / 255, b: c.b / 255, a: c.a }];
          }),
        ),
      ]),
    ),
  )};\nconst leafDensity = ${JSON.stringify(densityTokens)};\n`,
);
const plugin = await fs.readFile(path.join(pluginPath, 'source.js'), 'utf8');
await fs.writeFile(
  path.join(pluginPath, 'code.js'),
  `${await fs.readFile(path.join(pluginPath, 'tokens.js'), 'utf8')}\n${plugin}`,
);
// A small deterministic ZIP avoids a platform-dependent archive CLI.
const localFiles = [],
  centralFiles = [];
let offset = 0;
for (const name of ['manifest.json', 'code.js', 'README.md']) {
  const filename = Buffer.from(name),
    data = await fs.readFile(path.join(pluginPath, name));
  const checksum = crc32(data),
    header = Buffer.alloc(30),
    central = Buffer.alloc(46);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6);
  header.writeUInt16LE(23879, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(filename.length, 26);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(23879, 14);
  central.writeUInt32LE(checksum, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(filename.length, 28);
  central.writeUInt32LE(offset, 42);
  localFiles.push(header, filename, data);
  centralFiles.push(central, filename);
  offset += header.length + filename.length + data.length;
}
const directory = Buffer.concat(centralFiles),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(3, 8);
end.writeUInt16LE(3, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
await fs.writeFile(
  path.join(publicPath, 'leaf-figma-plugin.zip'),
  Buffer.concat([...localFiles, directory, end]),
);
console.log(
  'Exported DTCG/Tokens Studio tokens, four editable SVG sheets and a local Figma plugin.',
);
