import type { BreadcrumbItem } from '@ifhover/leaf-ui';
import { Breadcrumb, Space } from '@ifhover/leaf-ui';
import { House } from 'lucide-react';

const items: readonly BreadcrumbItem[] = [
  { title: '首页', href: '#基础用法', icon: <House size={14} /> },
  { title: '项目', href: '#基础用法' },
  { title: 'Leaf Garden' },
];
export function BreadcrumbBasic() {
  return (
    <Space direction="vertical" align="stretch">
      <Breadcrumb items={items} />
      <Breadcrumb items={items} separator="/" />
    </Space>
  );
}
