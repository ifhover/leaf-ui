import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileStringAsync } from 'sass-embedded';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const common = ["@use 'styles/tokens';", "@use 'shared/floating';", "@use 'button/button';"];
const dependencies = {
  button: ['dropdown'],
  inputnumber: ['input'],
  autocomplete: ['input', 'select'],
  datepicker: ['timepicker'],
  datetimepicker: ['datepicker', 'timepicker'],
  daterangepicker: ['datepicker', 'timepicker'],
  timepicker: ['datepicker'],
  timerangepicker: ['datepicker', 'timepicker'],
  treeselect: ['select', 'tree'],
  tree: ['checkbox', 'result'],
  slider: ['tooltip'],
  cascader: ['input', 'checkbox'],
  colorpicker: ['input', 'inputnumber', 'slider', 'tooltip'],
  form: [],
  confirm: ['modal'],
  drawer: ['modal'],
  message: ['alert'],
  notification: ['alert'],
  filelist: ['image', 'modal'],
  upload: ['filelist'],
  imagecropper: ['input', 'image'],
  transfer: ['checkbox', 'input', 'pagination'],
  pagination: ['select', 'inputnumber'],
  list: ['avatar', 'loading', 'result'],
  typography: [],
  tour: [],
  floatbutton: ['tooltip'],
  mentions: ['textarea'],
  commandpalette: ['modal', 'input'],
  appbar: [],
  empty: ['result'],
  virtuallist: ['result'],
  infinitescroll: ['loading', 'result'],
  configprovider: ['message', 'confirm', 'notification', 'loadingbar'],
  'config-provider': ['message', 'confirm', 'notification', 'loadingbar'],
  tag: ['checkbox'],
  inputotp: ['input'],
  inputmask: ['input'],
  popover: [],
  popconfirm: ['popover', 'alert'],
  tabs: ['dropdown'],
};
const resolveStyles = (name, visited = new Set()) => {
  if (visited.has(name)) return visited;
  visited.add(name);
  for (const dependency of dependencies[name] ?? []) resolveStyles(dependency, visited);
  return visited;
};
const source = path.join(root, 'src');
const recipes = new Set(
  (await readFile(path.join(source, 'color-recipes.ts'), 'utf8')).match(/--leaf-color-[\w-]+/gu),
);
const prunePalette = (css) => {
  const used = new Set([...css.matchAll(/var\((--leaf-color-[\w-]+)/gu)].map((match) => match[1]));
  return css.replace(/(--leaf-color-[\w-]+):[^;{}]+;/gu, (declaration, key) =>
    recipes.has(key) && !used.has(key) ? '' : declaration,
  );
};
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const directories = [
  ...new Set(
    Object.values(manifest.exports)
      .filter((entry) => entry?.import?.default)
      .map((entry) => entry.import.default.match(/^\.\/dist\/esm\/([^/]+)\/index\.js$/u)?.[1])
      .filter(Boolean),
  ),
];
const hasStyle = async (name) => {
  try {
    return (await stat(path.join(source, name, `${name}.scss`))).isFile();
  } catch {
    return false;
  }
};
let count = 0;
for (const name of directories) {
  const modules = new Set(common);
  for (const component of resolveStyles(name))
    if (await hasStyle(component)) modules.add(`@use '${component}/${component}';`);
  const compiled = await compileStringAsync([...modules].join('\n'), {
    style: 'compressed',
    loadPaths: [source, path.join(root, 'node_modules'), path.join(root, '../../node_modules')],
    importers: [
      {
        findFileUrl(url) {
          if (url.startsWith('.')) return null;
          try {
            return pathToFileURL(require.resolve(url));
          } catch {
            return null;
          }
        },
      },
    ],
  });
  for (const format of ['esm', 'cjs']) {
    const output = path.join(root, 'dist', format, 'styles');
    await mkdir(output, { recursive: true });
    await writeFile(path.join(output, `${name}.css`), prunePalette(compiled.css));
  }
  count++;
}
console.log(`Built ${count} standalone component styles, including their visual dependencies.`);
