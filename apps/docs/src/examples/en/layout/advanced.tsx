import { Card, Layout, Menu, useBreakpoint } from '@ifhover/leaf-ui';
import { Folder, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
export function LayoutResponsive() {
  const [collapsed, setCollapsed] = useState(false);
  const { sm } = useBreakpoint();
  const compact = collapsed || !sm;
  const [selected, setSelected] = useState('overview');
  const items = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
    { key: 'projects', label: 'Projects', icon: <Folder /> },
  ];
  return (
    <Layout direction="horizontal">
      <Layout.Sider
        width={180}
        collapsedWidth={64}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible
        breakpoint={575}
      >
        <Menu collapsed={compact} selectedKey={selected} onSelect={setSelected} items={items} />
      </Layout.Sider>
      <Layout.Content>
        <Card title={items.find((item) => item.key === selected)?.label}>
          Select a navigation item to view its content.
        </Card>
      </Layout.Content>
    </Layout>
  );
}
