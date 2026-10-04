import { Layout, Menu } from '@sudden3/leaf-ui';

export function LayoutBasic() {
  return (
    <Layout
      style={{
        borderRadius: 'var(--leaf-radius)',
        overflow: 'hidden',
        background: 'var(--leaf-color-surface-muted)',
      }}
    >
      <Layout.Header>
        <strong>Leaf Studio</strong>
      </Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sider width={160} collapsible>
          <Menu
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'projects', label: 'Projects' },
            ]}
            defaultSelectedKey="overview"
          />
        </Layout.Sider>
        <Layout.Content>Project content</Layout.Content>
      </Layout>
      <Layout.Footer>Workspace</Layout.Footer>
    </Layout>
  );
}
