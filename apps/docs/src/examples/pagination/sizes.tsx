import { Pagination, Space, Text } from '@ifhover/leaf-ui';

export function PaginationSizes() {
  return (
    <Space direction="vertical" align="center" size="lg">
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">小尺寸</Text>
        <Pagination total={30} defaultCurrent={2} size="sm" />
      </Space>
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">默认尺寸</Text>
        <Pagination total={30} defaultCurrent={2} size="md" />
      </Space>
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">大尺寸</Text>
        <Pagination total={30} defaultCurrent={2} size="lg" />
      </Space>
    </Space>
  );
}
