import { Breadcrumb } from '@ifhover/leaf-ui';

export function Capabilities() {
  return (
    <Breadcrumb
      aria-label="折叠后的文档路径"
      items={[
        { title: '首页', href: 'https://ifhover.github.io/leaf-ui/' },
        { title: '组件', href: 'https://ifhover.github.io/leaf-ui/components/index.html' },
        { title: 'Breadcrumb', href: '#基础用法' },
        { title: 'API' },
      ]}
      maxItems={3}
    />
  );
}
