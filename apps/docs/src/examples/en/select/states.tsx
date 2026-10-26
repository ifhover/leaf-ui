import { Flex, Select, Text } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function SelectStates() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Disabled</Text>
        <Select
          aria-label="Disabled team selection"
          options={options}
          defaultValue="design"
          disabled
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Loading</Text>
        <Select aria-label="Loading teams" options={[]} loading placeholder="Loading" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Empty options</Text>
        <Select
          aria-label="No available teams"
          options={[]}
          notFoundContent="No teams yet"
          placeholder="No teams available"
        />
      </Flex>
    </Flex>
  );
}
