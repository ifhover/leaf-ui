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
        <Text tone="muted">Match the field</Text>
        <Select aria-label="Match the field" options={options} placeholder="Select a project" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Fit content, up to 320px</Text>
        <Select
          aria-label="Fit content, up to 320px"
          popupWidth="auto"
          popupMaxWidth={320}
          options={options}
          placeholder="Select a project"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Fixed 300px</Text>
        <Select
          aria-label="Fixed 300px"
          popupWidth={300}
          options={options}
          placeholder="Select a project"
        />
      </Flex>
    </Flex>
  );
}
