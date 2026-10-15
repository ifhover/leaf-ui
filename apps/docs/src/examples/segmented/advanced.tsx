import { Segmented, Space, Text } from '@ifhover/leaf-ui';

export function SegmentedOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">填满容器</Text>
      <Segmented
        block
        options={[
          { value: 'list', label: '列表' },
          { value: 'grid', label: '栅格' },
          { value: 'archived', label: '归档（不可用）', disabled: true },
        ]}
      />
      <Text tone="muted">小尺寸</Text>
      <Segmented size="sm" options={['A', 'B', 'C']} />
    </Space>
  );
}
