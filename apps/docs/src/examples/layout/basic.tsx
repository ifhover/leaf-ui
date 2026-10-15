import { Layout, Text } from '@ifhover/leaf-ui';
export function LayoutBasic() {
  return (
    <Layout>
      <Layout.Header>
        <Text>顶部导航</Text>
      </Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sider width={140}>侧栏</Layout.Sider>
        <Layout.Content>正文内容</Layout.Content>
      </Layout>
      <Layout.Footer>底部信息</Layout.Footer>
    </Layout>
  );
}
