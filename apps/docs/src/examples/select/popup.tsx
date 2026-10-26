import { Flex, Select, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'garden', label: 'Leaf Garden Design System' },
  { value: 'studio', label: 'Leaf Studio' },
  { value: 'notes', label: 'Leaf Notes' },
];

export function SelectPopup() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">跟随控件</Text>
        <Select aria-label="跟随控件" options={options} placeholder="选择项目" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">按内容定宽，最大 320px</Text>
        <Select
          aria-label="按内容定宽，最大 320px"
          popupWidth="auto"
          popupMaxWidth={320}
          options={options}
          placeholder="选择项目"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">固定 300px</Text>
        <Select aria-label="固定 300px" popupWidth={300} options={options} placeholder="选择项目" />
      </Flex>
    </Flex>
  );
}
