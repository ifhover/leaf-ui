import { Layout, Menu, Text, useBreakpoint } from '@ifhover/leaf-ui';
import { Folder, House } from 'lucide-react';
import { useState } from 'react';

export function LayoutResponsive() {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState('home');
  const { sm } = useBreakpoint();
  const compact = collapsed || !sm;
  const items = [
    { key: 'home', label: '首页', icon: <House /> },
    { key: 'documents', label: '文档', icon: <Folder /> },
  ];
  return (
    <Layout direction="horizontal">
      <Layout.Sider
        width={180}
        collapsedWidth={84}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible
        breakpoint={575}
      >
        <Menu collapsed={compact} selectedKey={selected} onSelect={setSelected} items={items} />
      </Layout.Sider>
      <Layout.Content>
        <Text role="status">{items.find((item) => item.key === selected)?.label}</Text>
      </Layout.Content>
    </Layout>
  );
}
