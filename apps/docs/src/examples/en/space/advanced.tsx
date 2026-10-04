import { Space, Tag } from '@sudden3/leaf-ui';

export function SpaceVertical() {
  return (
    <Space direction="vertical" size={12} align="start">
      <Tag>Pending</Tag>
      <Tag color="success">Complete</Tag>
      <Space split={<span>·</span>} size={8}>
        <span>Leaf UI</span>
        <span>React</span>
      </Space>
    </Space>
  );
}
