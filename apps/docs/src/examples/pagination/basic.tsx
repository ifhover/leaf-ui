import { Pagination, Space, Text } from '@ifhover/leaf-ui';

export function PaginationBasic() {
  return (
    <Space direction="vertical" align="center" size="lg">
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">描边（默认）</Text>
        <Pagination total={50} defaultCurrent={2} />
      </Space>
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">无边框</Text>
        <Pagination total={50} defaultCurrent={2} variant="ghost" />
      </Space>
    </Space>
  );
}
