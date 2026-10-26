import { Layout, Text } from '@ifhover/leaf-ui';

export function LayoutBasic() {
  return (
    <Layout>
      <Layout.Header>
        <Text>页头</Text>
      </Layout.Header>
      <Layout direction="horizontal">
        <Layout.Sider width={140}>
          <Text>侧栏</Text>
        </Layout.Sider>
        <Layout.Content>
          <Text>正文内容</Text>
        </Layout.Content>
      </Layout>
      <Layout.Footer>
        <Text>页脚</Text>
      </Layout.Footer>
    </Layout>
  );
}
