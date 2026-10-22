import { Card, Layout, Menu, useBreakpoint } from '@ifhover/leaf-ui';
import { Folder, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
export function LayoutResponsive() {
  const [collapsed, setCollapsed] = useState(false);
  const { sm } = useBreakpoint();
  const compact = collapsed || !sm;
  const [selected, setSelected] = useState('overview');
  const items = [
    { key: 'overview', label: '概览', icon: <LayoutDashboard /> },
    { key: 'projects', label: '项目', icon: <Folder /> },
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
        <Card title={items.find((item) => item.key === selected)?.label}>选择导航项查看内容。</Card>
      </Layout.Content>
    </Layout>
  );
}
