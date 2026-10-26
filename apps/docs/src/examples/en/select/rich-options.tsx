import { Select, Space, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'garden', label: 'Leaf Garden Design System' },
  { value: 'studio', label: 'Leaf Studio' },
  { value: 'notes', label: 'Leaf Notes' },
];

export function SelectRichOptions() {
  return (
    <Select
      aria-label="Choose a project"
      options={options}
      placeholder="Select a project"
      optionRender={(option) => (
        <Space direction="vertical" align="stretch" size={0}>
          <Text strong>{option.label}</Text>
          <Text tone="muted">{option.value}</Text>
        </Space>
      )}
    />
  );
}
