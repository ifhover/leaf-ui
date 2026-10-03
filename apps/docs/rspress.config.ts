import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginSass } from '@rsbuild/plugin-sass';
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
    items: [
      { text: '定制主题', link: '/guide/theming' },
      { text: '使用图标', link: '/guide/icons' },
    ],
  },
];

const componentSidebar = [
  {
    text: '组件',
    items: [{ text: '组件总览', link: '/components/' }],
  },
  {
    text: '通用',
    items: [{ text: 'Button', tag: '按钮', link: '/components/button' }],
  },
  {
    text: '数据录入',
    items: [
      { text: 'Input', tag: '输入框', link: '/components/input' },
      { text: 'Textarea', tag: '文本域', link: '/components/textarea' },
      { text: 'Checkbox', tag: '复选框', link: '/components/checkbox' },
      { text: 'Radio', tag: '单选框', link: '/components/radio' },
      { text: 'Switch', tag: '开关', link: '/components/switch' },
      { text: 'Select', tag: '选择器', link: '/components/select' },
      { text: 'DatePicker', tag: '日期选择器', link: '/components/date-picker' },
      { text: 'TimePicker', tag: '时间选择器', link: '/components/time-picker' },
      { text: 'AutoComplete', tag: '自动完成', link: '/components/auto-complete' },
      { text: 'Cascader', tag: '级联选择', link: '/components/cascader' },
    ],
  },
];

export default defineConfig({
  root: path.join(directory, 'docs'),
  themeDir: path.join(directory, 'theme'),
  title: 'Leaf UI',
  description: '轻盈、自然、可定制的 React 组件库。统一的基础组件与表单，让界面自然生长。',
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
    plugins: [pluginSass()],
    resolve: {
      alias: {
        '@leaf-ui/react$': path.resolve(directory, '../../packages/react/src/index.ts'),
        '@leaf-ui/react/styles.css$': path.resolve(
          directory,
          '../../packages/react/src/styles/index.scss',
        ),
      },
    },
  },
});
