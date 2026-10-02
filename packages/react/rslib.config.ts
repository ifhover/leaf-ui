import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  // CommonJS exposes the exports of the final entry, so the component API comes last.
  source: { entry: { index: ['./src/styles/index.css', './src/index.ts'] } },
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      dts: { abortOnError: true, autoExtension: true },
      banner: { js: '"use client";' },
      output: { distPath: { root: 'dist/esm' } },
    },
    {
      format: 'cjs',
      syntax: 'es2022',
      dts: { abortOnError: true, autoExtension: true },
      banner: { js: '"use client";' },
      output: { distPath: { root: 'dist/cjs' } },
    },
  ],
  output: {
    target: 'web',
    sourceMap: { js: 'source-map', css: true },
  },
  plugins: [pluginReact()],
});
