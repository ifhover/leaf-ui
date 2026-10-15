import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const namespaces = {
  colors: 'color',
  borderRadius: 'radius',
  spacing: 'spacing',
  fontFamily: 'font',
  fontSize: 'text',
  lineHeight: 'leading',
  fontWeight: 'font-weight',
  boxShadow: 'shadow',
  transitionDuration: 'transition-duration',
  transitionTimingFunction: 'ease',
  zIndex: 'z-index',
};

export function renderTailwindTheme(tokens) {
  const declarations = Object.entries(namespaces).flatMap(([group, namespace]) =>
    Object.entries(tokens[group]).flatMap(([name, value]) => [
      `  --${namespace}-${name}: ${value};`,
      ...(group === 'fontSize'
        ? [`  --text-${name}--line-height: ${tokens.lineHeight.leaf};`]
        : []),
    ]),
  );
  return `/* Generated from Leaf UI's shared Tailwind token map. Tailwind CSS 4 only. */\n@theme inline {\n${declarations.join('\n')}\n}\n`;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const { leafTailwindTokens } = await import('../dist/esm/tailwind-tokens.js');
  await writeFile(
    new URL('../dist/tailwind.css', import.meta.url),
    renderTailwindTheme(leafTailwindTokens),
  );
}
