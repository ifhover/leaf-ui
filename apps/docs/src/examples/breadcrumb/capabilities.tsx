import { Breadcrumb } from '@ifhover/leaf-ui';

const items = (english: boolean) => [
  { title: english ? 'Home' : '首页', href: '#home' },
  { title: english ? 'Workspace' : '工作区', href: '#workspace' },
  { title: english ? 'Projects' : '项目', href: '#projects' },
  { title: 'Leaf UI', href: '#leaf' },
  { title: english ? 'Tokens' : '设计令牌' },
];

export function Capabilities({ english = false }) {
  return (
    <Breadcrumb
      aria-label={english ? 'Collapsed project path' : '折叠后的项目路径'}
      items={items(english)}
      maxItems={3}
    />
  );
}
