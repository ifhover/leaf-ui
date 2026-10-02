import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rspress/core';

const directory = path.dirname(fileURLToPath(import.meta.url));

const guideSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '认识 Leaf UI', link: '/guide/introduction' },
      { text: '安装', link: '/guide/installation' },
      { text: '快速开始', link: '/guide/getting-started' },
    ],
  },
  {
    text: '个性化',
    items: [{ text: '定制主题', link: '/guide/theming' }],
  },
];

const componentSidebar = [
  {
    text: '组件',
    items: [{ text: '组件总览', link: '/components/' }],
  },
  {
    text: '通用',
    items: [{ text: 'Button 按钮', link: '/components/button' }],
  },
];

export default defineConfig({
  root: path.join(directory, 'docs'),
  themeDir: path.join(directory, 'theme'),
  title: 'Leaf UI',
  description: '轻盈、自然、可定制的 React 组件库。从一个按钮开始，让界面自然生长。',
  lang: 'zh',
  icon: '/leaf.svg',
  logo: '/leaf.svg',
  logoText: 'Leaf UI',
  outDir: 'doc_build',
  markdown: { link: { checkDeadLinks: true } },
  themeConfig: {
    darkMode: 'light',
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '^/guide/' },
      { text: '组件', link: '/components/', activeMatch: '^/components/' },
    ],
    sidebar: { '/guide/': guideSidebar, '/components/': componentSidebar },
    socialLinks: [{ icon: 'github', mode: 'link', content: 'https://github.com/ifhover/leaf-ui' }],
  },
  builderConfig: {
    resolve: {
      alias: {
        '@leaf-ui/react$': path.resolve(directory, '../../packages/react/src/index.ts'),
        '@leaf-ui/react/styles.css$': path.resolve(
          directory,
          '../../packages/react/src/styles/index.css',
        ),
      },
    },
  },
});
