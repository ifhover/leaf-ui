import { Segmented, Space, Text } from '@ifhover/leaf-ui';

export function SegmentedOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">Fill container</Text>
      <Segmented
        block
        options={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
          { value: 'archived', label: 'Archive (unavailable', disabled: true },
        ]}
      />
      <Text tone="muted">Small size</Text>
      <Segmented size="sm" options={['A', 'B', 'C']} />
    </Space>
  );
}
