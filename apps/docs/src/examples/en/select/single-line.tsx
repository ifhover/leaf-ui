import { Flex, Select, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: 'Product design team with a longer name' },
  { value: 'web', label: 'Frontend development' },
  { value: 'server', label: 'Backend development' },
  { value: 'operations', label: 'Daily operations' },
];
const selected = options.map((option) => option.value);

export function SingleLine() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Default wrapping</Text>
        <Select
          aria-label="Wrapping team tags"
          multiple
          options={options}
          defaultValue={selected}
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Single line</Text>
        <Select
          aria-label="Single-line team tags"
          multiple
          tagWrap={false}
          options={options}
          defaultValue={selected}
        />
      </Flex>
    </Flex>
  );
}
