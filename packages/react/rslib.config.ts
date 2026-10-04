import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**/*.ts', './src/**/*.tsx', '!./src/**/*.test.ts', '!./src/**/*.test.tsx'],
      styles: './src/styles/index.scss',
    },
  },
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: 'es2022',
      dts: { abortOnError: true, autoExtension: true },
      banner: { js: '"use client";' },
      output: { distPath: { root: 'dist/esm' } },
    },
    {
      format: 'cjs',
      bundle: false,
      syntax: 'es2022',
      dts: { abortOnError: true, autoExtension: true },
      banner: { js: '"use client";' },
      output: { distPath: { root: 'dist/cjs' } },
    },
  ],
  output: {
    filename: { css: 'index.css' },
    target: 'web',
    sourceMap: { js: 'source-map', css: true },
  },
  plugins: [pluginReact(), pluginSass()],
});
