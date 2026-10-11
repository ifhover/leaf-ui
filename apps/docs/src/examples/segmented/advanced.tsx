import { Segmented, Space } from '@ifhover/leaf-ui';

export function SegmentedOptions() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <strong className="leaf-demo-note">填满容器</strong>
      <Segmented
        block
        options={[
          { value: 'list', label: '列表' },
          { value: 'grid', label: '栅格' },
          { value: 'archived', label: '归档（不可用）', disabled: true },
        ]}
      />
      <strong className="leaf-demo-note">小尺寸</strong>
      <Segmented size="sm" options={['A', 'B', 'C']} />
    </Space>
  );
}
