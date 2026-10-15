import type { BreadcrumbItem } from '@ifhover/leaf-ui';
import { Breadcrumb, Space } from '@ifhover/leaf-ui';
import { House } from 'lucide-react';

const items: readonly BreadcrumbItem[] = [
  { title: 'Home', href: '#basic-usage', icon: <House size={14} /> },
  { title: 'Projects', href: '#basic-usage' },
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
