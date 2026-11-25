import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';

const sourceFiles = [
  './src/**/*.ts',
  './src/**/*.tsx',
  '!./src/**/*.test.ts',
  '!./src/**/*.test.tsx',
];

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: 'es2022',
      source: {
        entry: {
          index: sourceFiles,
          styles: './src/styles/index.scss',
        },
      },
      dts: { abortOnError: true, autoExtension: true },
      banner: { js: '"use client";' },
      output: { distPath: { root: 'dist/esm' } },
    },
    {
      format: 'cjs',
      bundle: false,
      syntax: 'es2022',
      source: {
        entry: {
          index: sourceFiles,
        },
      },
      dts: { abortOnError: true, autoExtension: true },
      banner: { js: '"use client";' },
      output: { distPath: { root: 'dist/cjs' } },
    },
  ],
  output: {
    filename: { css: 'index.css' },
    minify: { js: false, css: true },
    target: 'web',
    sourceMap: { js: 'source-map', css: true },
  },
  plugins: [pluginReact(), pluginSass()],
});
