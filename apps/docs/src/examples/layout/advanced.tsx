import { Layout } from '@sudden3/leaf-ui';

export function LayoutResponsive() {
  return (
    <Layout
      direction="horizontal"
      style={{ background: 'var(--leaf-color-surface-muted)', minHeight: 180 }}
    >
      <Layout.Sider width={180} collapsedWidth={64} breakpoint={640}>
        <strong>Leaf</strong>
      </Layout.Sider>
      <Layout.Content>在窄屏上侧栏自动收起。</Layout.Content>
    </Layout>
  );
}
