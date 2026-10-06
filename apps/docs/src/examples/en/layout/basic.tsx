import { Layout } from '@sudden3/leaf-ui';

export function LayoutBasic() {
  return (
    <Layout
      style={{
        width: '100%',
        minHeight: 300,
        border: '1px solid var(--leaf-color-border)',
        borderRadius: 'var(--leaf-radius)',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <Layout.Header
        style={{
          background: 'var(--leaf-color-primary-surface-14)',
          color: 'var(--leaf-color-primary)',
          fontWeight: 600,
        }}
      >
        Header
      </Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sider
          width="26%"
          style={{
            display: 'grid',
            placeItems: 'center',
            background: 'var(--leaf-color-primary-surface-9)',
          }}
        >
          Sider
        </Layout.Sider>
        <Layout.Content style={{ display: 'grid', placeItems: 'center', minHeight: 180 }}>
          Content
        </Layout.Content>
      </Layout>
      <Layout.Footer
        style={{
          background: 'var(--leaf-color-primary-surface-6)',
        }}
      >
        Footer
      </Layout.Footer>
    </Layout>
  );
}
