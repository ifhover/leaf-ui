import { Pagination, Space, Text } from '@ifhover/leaf-ui';

export function PaginationStates() {
  return (
    <Space direction="vertical" align="center" size="lg">
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">Simple</Text>
        <Pagination total={240} defaultCurrent={3} simple />
      </Space>
      <Space direction="vertical" align="start" size="sm">
        <Text tone="muted">Disabled</Text>
        <Pagination total={50} defaultCurrent={2} disabled />
      </Space>
    </Space>
  );
}
