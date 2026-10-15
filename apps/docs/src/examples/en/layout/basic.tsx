import { Layout, Text } from '@ifhover/leaf-ui';
export function LayoutBasic() {
  return (
    <Layout>
      <Layout.Header>
        <Text>Header</Text>
      </Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sider width={140}>Sidebar</Layout.Sider>
        <Layout.Content>Content</Layout.Content>
      </Layout>
      <Layout.Footer>Footer</Layout.Footer>
    </Layout>
  );
}
