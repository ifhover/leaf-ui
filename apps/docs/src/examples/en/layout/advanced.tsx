import { Layout, Menu } from '@sudden3/leaf-ui';
import {
  Folder,
  LayoutDashboard,
  Leaf,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function LayoutResponsive() {
  const [collapsed, setCollapsed] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [selected, setSelected] = useState('overview');
  useEffect(() => {
    const query = matchMedia('(max-width: 640px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const compact = collapsed || narrow;
  const items = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
    { key: 'projects', label: 'Projects', icon: <Folder /> },
    { key: 'settings', label: 'Settings', icon: <Settings /> },
  ];
  return (
    <Layout
      direction="horizontal"
      style={{
        width: '100%',
        minHeight: 360,
        border: '1px solid var(--leaf-color-border)',
        borderRadius: 'var(--leaf-radius)',
        overflow: 'hidden',
      }}
    >
      <Layout.Sider
        width={180}
        collapsedWidth={64}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible
        breakpoint={640}
        trigger={compact ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        style={{ borderInlineEnd: '1px solid var(--leaf-color-border)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: compact ? 'center' : 'flex-start',
            gap: 8,
            height: 48,
            paddingInline: compact ? 0 : 12,
            color: 'var(--leaf-color-primary)',
          }}
        >
          <Leaf size={20} aria-hidden="true" />
          {!compact && <strong>Leaf Studio</strong>}
        </div>
        <Menu
          items={items}
          collapsed={compact}
          selectedKey={selected}
          onSelect={setSelected}
          style={{ width: '100%', background: 'transparent', padding: 0 }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ borderBottom: '1px solid var(--leaf-color-border)' }}>
          <strong>Workspace</strong>
        </Layout.Header>
        <Layout.Content style={{ padding: 20 }}>
          <div style={{ color: 'var(--leaf-color-text-muted)', fontSize: 12, marginBottom: 12 }}>
            Workspace / {items.find((item) => item.key === selected)?.label}
          </div>
          <div
            style={{
              minHeight: 140,
              padding: 20,
              background: 'var(--leaf-color-surface)',
              border: '1px solid var(--leaf-color-border)',
              borderRadius: 'var(--leaf-radius)',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 600 }}>
              {items.find((item) => item.key === selected)?.label}
            </h3>
            <p style={{ margin: 0, color: 'var(--leaf-color-text-muted)', lineHeight: 1.7 }}>
              Manage projects and track progress in one workspace.
            </p>
          </div>
        </Layout.Content>
        <Layout.Footer
          style={{
            padding: '12px 20px',
            background: 'transparent',
            textAlign: 'center',
            color: 'var(--leaf-color-text-muted)',
            fontSize: 12,
          }}
        >
          Leaf Studio · Workspace
        </Layout.Footer>
      </Layout>
    </Layout>
  );
}
