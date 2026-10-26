import { Layout, Text } from '@ifhover/leaf-ui';

export function LayoutBasic() {
  return (
    <Layout>
      <Layout.Header>
        <Text>Header</Text>
      </Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sider width={140}>
          <Text>Sidebar</Text>
        </Layout.Sider>
        <Layout.Content>
          <Text>Content</Text>
        </Layout.Content>
      </Layout>
      <Layout.Footer>
        <Text>Footer</Text>
      </Layout.Footer>
    </Layout>
  );
}
