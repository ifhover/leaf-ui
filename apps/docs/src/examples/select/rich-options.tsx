import { Select, Space, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'garden', label: 'Leaf Garden Design System' },
  { value: 'studio', label: 'Leaf Studio' },
  { value: 'notes', label: 'Leaf Notes' },
];

export function SelectRichOptions() {
  return (
    <Select
      aria-label="选择项目"
      options={options}
      placeholder="选择项目"
      optionRender={(option) => (
        <Space direction="vertical" align="stretch" size={0}>
          <Text strong>{option.label}</Text>
          <Text tone="muted">{option.value}</Text>
        </Space>
      )}
    />
  );
}
