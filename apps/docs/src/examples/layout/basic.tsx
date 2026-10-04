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
              { key: 'overview', label: '概览' },
              { key: 'projects', label: '项目' },
            ]}
            defaultSelectedKey="overview"
          />
        </Layout.Sider>
        <Layout.Content>项目内容</Layout.Content>
      </Layout>
      <Layout.Footer>工作空间</Layout.Footer>
    </Layout>
  );
}
